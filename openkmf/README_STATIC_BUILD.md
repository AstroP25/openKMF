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
