# openKMF static project build (Manage Radio removed)

This package uses the openKMF source tree supplied as the project source file. The original JavaScript implementation and CSS are retained; the Manage Radio navigation and its pages are hidden from the interface. Key-container workflows, key creation, key loading, and device connection pages remain available as in the source project. The “Show Key” visibility toggle is hidden.

## Run

Serve this directory from `https://` or `http://localhost` and open `index.html` in a supported Chromium-based browser. Web Serial requires a secure context and hardware permissions. Opening the file directly via `file://` will not enable all features.

## Dependencies

Bootstrap, Bootstrap Icons, jQuery, and pako are referenced from their public CDNs. The rest of the application JavaScript and CSS is included locally. Internet access is required to load those CDN dependencies.

## Notes

- Manage Radio UI (radio key/keyset/RSI/KMF inspection and management) is hidden.
- The “Show Key” toggle is hidden; the key field remains masked as a password field.
- Key Container management is retained; its menu entry named “Manage Keys” is for the container, not the radio.
- Actual device/key-fill operations require compatible hardware, a supported browser, and secure-context hosting. Test in a non-production environment first.
- This source retains the upstream MIT license in `LICENSE`. Third-party components retain their respective licenses.

## DKF export

The **Export Container to Distributed Key File** page creates encrypted `.dkf` files using the format and parameters in KFDtool 1.8.8's `ContainerUtilities.EncryptOuterContainerDKF`: gzip-compressed inner XML, AES-256-CBC encryption, PBKDF2-HMAC-SHA1 with 10,000 iterations, a random 32-byte salt, and a random 16-byte IV. Export is performed locally in the browser. As in the referenced KFDtool implementation, it exports DES (`0x81`) and AES (`0x84`) TEK keys, skipping KEKs and unsupported algorithms.
