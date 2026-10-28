/*
 * DKF export implementation based on KFDtool-1.8.8
 * ContainerUtilities.EncryptOuterContainerDKF in KFDtool.Container.
 * The DKF is generated locally in the browser; key material is not uploaded.
 */
(function () {
    "use strict";

    function xmlEscape(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    function keyToHex(value) {
        if (typeof value === "string") {
            return value.replace(/\s+/g, "").replace(/[^0-9a-f]/gi, "").toUpperCase();
        }
        if (value == null) return "";
        const bytes = (Array.isArray(value) || ArrayBuffer.isView(value)) ? Array.from(value) : [];
        return bytes.map(b => Number(b).toString(16).padStart(2, "0")).join("").toUpperCase();
    }

    function eligibleDkfKeys(container) {
        return (container.keys || []).filter(key =>
            (Number(key.AlgorithmId) === 0x81 || Number(key.AlgorithmId) === 0x84) && !key.KeyTypeKek
        );
    }

    function buildInnerDkfXml(container) {
        const params = [
            ["enablefips", "boolean", "false"], ["pin", "string", ""], ["kek", "string", ""],
            ["prevkek", "string", ""], ["desmac", "string", ""], ["prevdesmac", "string", ""],
            ["version", "integer", "5"], ["kekencryptionalg", "string", ""],
            ["desmacencryptionalg", "string", ""], ["tekencryptionalg", "string", "Unencrypted"],
            ["aesfipskek", "string", ""], ["prevaesfipskek", "string", ""],
            ["fipsmackey", "string", ""], ["prevfipsmackey", "string", ""],
            ["aesfipskekencryptionalg", "string", ""], ["fipsmackeyencryptionalg", "string", ""],
            ["pinisvalidflag", "boolean", "false"], ["ismaster", "boolean", "true"]
        ];
        const paramsXml = params.map((p, index) =>
            `<param ref="${String(index).padStart(12, "0")}" id="${p[0]}" type="${p[1]}" value="${xmlEscape(p[2])}" />`
        ).join("");
        const keysXml = eligibleDkfKeys(container).map(key => {
            const alg = Number(key.AlgorithmId) === 0x81 ? "Des" : "Aes";
            const keyValue = keyToHex(key.Key);
            return `<key alg="${alg}" plat="P25" id="${xmlEscape(key.KeyId)}" ksid="${xmlEscape(key.KeysetId)}" ksname="Set${String(key.KeysetId).padStart(3, "0")}" sln="${xmlEscape(key.Sln)}" ekid="0" ekalg="Unencrypted" keytype="Tek" value="${xmlEscape(keyValue)}" interop="False" />`;
        }).join("");
        return `<?xml version="1.0" encoding="utf-8"?><personality definition="1" device="1" name="KFDtool EKC to DKF" family="KeyManager"><ValueData /><valuedata>${paramsXml}${keysXml}</valuedata></personality>`;
    }

    async function gzipBytes(bytes) {
        if (window.pako && typeof window.pako.gzip === "function") {
            return window.pako.gzip(bytes);
        }
        if (typeof CompressionStream !== "undefined") {
            const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
            return new Uint8Array(await new Response(stream).arrayBuffer());
        }
        throw new Error("This browser does not support gzip compression required for DKF export.");
    }

    async function encryptDkf(container, password) {
        const innerXml = buildInnerDkfXml(container);
        const innerCompressed = await gzipBytes(new TextEncoder().encode(innerXml));
        const salt = crypto.getRandomValues(new Uint8Array(32));
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const passwordKey = await crypto.subtle.importKey(
            "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
        );
        // KFDtool-1.8.8 uses Rfc2898DeriveBytes(password, salt, 10000), whose default PRF is HMAC-SHA1.
        const aesKey = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt, iterations: 10000, hash: "SHA-1" },
            passwordKey,
            { name: "AES-CBC", length: 256 },
            false,
            ["encrypt"]
        );
        // WebCrypto AES-CBC applies PKCS#7 padding, matching the .NET AES CryptoStream output.
        const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", iv }, aesKey, innerCompressed));
        const b64 = bytes => btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
        const outerParams = [
            ["encryptMode", "string", "Aes256Cbc"],
            ["rfc2898", "boolean", "True"],
            ["iv", "string", b64(iv)],
            ["salt", "string", b64(salt)],
            ["iterations", "int32", "10000"],
            ["content", "string", b64(ciphertext)]
        ].map(p => `<param id="${p[0]}" type="${p[1]}" value="${xmlEscape(p[2])}" />`).join("");
        const outerXml = `<?xml version="1.0" encoding="utf-8"?><personality pdlversion="2" defaultversion="1" valueversion="1" devicetype="KeyManager" targetversionmajor="0" targetversionminor="0" type="User" percategory="Encrypted"><ParamData /><paramdata>${outerParams}</paramdata></personality>`;
        return new TextEncoder().encode(outerXml);
    }

    function downloadBytes(bytes, filename) {
        const blob = new Blob([bytes], { type: "application/xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename.toLowerCase().endsWith(".dkf") ? filename : `${filename}.dkf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    $(function () {
        const button = document.querySelector("#createDkf");
        if (!button) return;
        button.addEventListener("click", async () => {
            const filename = document.querySelector("#exportDkf_filename").value.trim();
            const password = document.querySelector("#exportDkf_password").value;
            const verify = document.querySelector("#exportDkf_passwordVerify").value;
            if (!(_keyContainer && Array.isArray(_keyContainer.keys) && _keyContainer.keys.length)) {
                alert("Open or create a key container before exporting a DKF.");
                return;
            }
            if (eligibleDkfKeys(_keyContainer).length === 0) {
                alert("No exportable DES or AES TEK keys were found. KFDtool DKF export skips KEKs and unsupported algorithms.");
                return;
            }
            if (!filename) {
                alert("Please enter a file name.");
                return;
            }
            if (!password) {
                alert("Please enter a password.");
                return;
            }
            if (password !== verify) {
                alert("Passwords do not match. Please verify the password.");
                return;
            }
            if (password.length < 16 && !window.confirm("This password is under 16 characters. Continue anyway?")) return;
            button.disabled = true;
            const originalText = button.textContent;
            button.textContent = "Encrypting and exporting…";
            try {
                const bytes = await encryptDkf(_keyContainer, password);
                downloadBytes(bytes, filename);
                document.querySelector("#exportDkf_password").value = "";
                document.querySelector("#exportDkf_passwordVerify").value = "";
                document.querySelector("#exportDkf_filename").value = "";
                alert("DKF export complete. Store the file and its password securely.");
            } catch (error) {
                console.error("DKF export failed", error);
                alert(`DKF export failed: ${error.message || error}`);
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    });
})();
