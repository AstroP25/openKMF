# openKMF: Tactical KMF Interoperability and Development Roadmap

## Project intent

openKMF is intended to be a local, browser-based **Tactical Key Management Facility (Tactical KMF)** focused on key-container management and interoperability with field key-management equipment. It is not initially intended to replace an infrastructure-scale KMF or to implement every KMF network service.

The project's initial goal, supplied with the project sources, is to provide a local web application that can run in an OCI-compliant platform, create and manage EKC containers, and import/export DKF files using functionality informed by the referenced open-source projects.

## Current workflows and intended role

| Workflow | Role in openKMF | Notes / boundaries |
|---|---|---|
| EKC container management | Create, edit, organize, import, and export encrypted key containers. | Keep the container model independent of any one radio vendor. Protect container passwords and key material. |
| Load via TWI / 3WI | Retain the existing KFDtool-compatible Three-Wire Interface workflow. | Important for direct key loading and for the KVL-to-KVL key-sharing workflow supported by the KFDtool Mobile Radio (MR) Emulator path. Do not remove this workflow when adding container features. |
| Export Container to Distributed Key File | Export compatible container contents to a `.dkf` file. | The current implementation is based on `ContainerUtilities.EncryptOuterContainerDKF` from the supplied KFDtool 1.8.8 source. Interoperability with each receiving radio or KMF should be tested with non-production material. |
| KFD/KVL IP connection | Potential connector path for equipment and KMFs that expose a documented, supported IP interface. | Do not assume one vendor's IP protocol or session model is interchangeable with another's. Motorola KVL/KMF IP or SLIP details require model-specific interface documentation and test equipment. |
| KFDpro | Project context identifies KFDpro as a target that supports the container workflow and an IP interface. | This statement is based on project-owner context. The public KFDtool references reviewed for this note did not identify a product named exactly “KFDpro” or provide enough detail to specify its protocol. Confirm the exact vendor/model and interface documentation before implementing a dedicated adapter. |
| TKMD compatibility | Investigate and document interoperability with Christine Wireless's Tactical Key Management Device. | Public product material describes key-fill-device interfaces and OTAR functions. A successful connection, container interchange, or specific command support must not be inferred solely from product-level descriptions. Test the actual desired workflow. |
| Tactical OTAR over USB | Candidate future workstream. | Treat as a separate interface/adapter project after the supported USB protocol, device role, and authorization model are established. Do not conflate USB hardware access with OTAR itself. |
| OTAR via DFSI | Explicitly deferred for now. | Preserve as a later topic. Do not make DFSI networking a dependency of container management, DKF export, or TWI loading. |

## Suggested architecture

Use a small set of clearly separated services/adapters rather than a single universal KMF protocol implementation:

1. **Container domain** — EKC import/export, key/group metadata, validation, password handling, and DKF conversion.
2. **Transfer workflow** — user-selected operation, selected target/interface, preflight validation, confirmation, progress, and result reporting.
3. **TWI/3WI adapter** — retain and regression-test the existing KFDtool-compatible implementation.
4. **DKF adapter** — retain DKF import/export as a file interchange boundary; do not describe file creation as successful delivery to a radio.
5. **Vendor/IP adapters** — add one at a time, only against a documented and testable interface. Keep model, firmware, connection mode (IP/SLIP), supported operations, and limitations explicit.
6. **Future USB Tactical OTAR adapter** — separate from the static browser UI if the device protocol or operating-system USB access requires a local service or native bridge.

A connector should declare its capabilities (for example, container import/export, TWI key loading, IP session, or OTAR command support) instead of implying every connected device supports every operation.

## Recommended development order

### 1. Stabilize current container workflows

- Maintain EKC import/export and DKF export as separate, testable functions.
- Add format-level tests using synthetic/non-production test fixtures.
- Verify exported DKF files with the intended receiving application/device before claiming interoperability.
- Keep key visibility disabled by default and avoid exposing key bytes in logs, diagnostics, URLs, or error text.

### 2. Preserve and test TWI

- Keep “Load via TWI” visible and available.
- Regression-test connection, target detection, key-load selection, success/failure handling, and disconnect/reconnect behavior with approved test equipment.
- Document tested combinations of adapter, cable, radio/keyloader model, firmware, browser, and operating system.
- Treat KVL-to-KVL key sharing as a distinct workflow from loading a radio; test the MR Emulator mode and its limits separately from KFD mode.

### 3. Define a connector contract

Each adapter should provide at least:

- connector identity and version;
- detected device/target identity where available;
- supported operations and known restrictions;
- preflight validation;
- operation start/result state;
- explicit distinction between “request submitted,” “device acknowledged,” and “operation confirmed.”

This makes future KFDpro, KVL/IP, TKMD, and USB interfaces additions rather than rewrites of the application.

### 4. Prototype the USB Tactical OTAR path

Before coding protocol behavior, confirm the exact device and USB interface, whether the host sees a serial, HID, USB CDC, vendor-specific, or network-class interface, and whether the protocol is documented/authorized for third-party integration. Build a capability probe and a non-production test harness first. If the interface requires long-running access, background work, or APIs unavailable in the browser, use a small local service and retain the browser as the UI.

### 5. Revisit DFSI OTAR later

When DFSI is in scope, treat it as a separate transport/network integration with its own security, routing, session, and acknowledgement requirements. It should not be coupled to the current container-management and file-interchange work.

## Safety and verification principles

- Use only authorized devices, interfaces, and key material.
- Use synthetic or explicitly non-production keys during development and acceptance testing.
- Do not claim successful delivery based only on successful file generation or a connector accepting a request.
- Keep audit records for operator actions and operation outcomes, but never log raw key material or passwords.
- Distinguish verified facts from project-owner-provided context and from unverified interoperability assumptions.

## Sources and confidence notes

### Supplied project sources

- `Goal.txt`: defines the local OCI-compliant Tactical KMF goal, including EKC management and DKF import/export.
- `KFDtool-1.8.8/README.md`: describes KFDtool-AVR hardware support and lists tested radio/device combinations. The supplied archive is a fork (`KFDTool-AVR`) and should not be treated as authoritative documentation for every product bearing a similar name.
- `KFDweb` source and README: documents the browser UI's KFDtool-compatible TWI/3WI workflow and notes that DLI/IP functions are not supported in the original KFDweb project. The current openKMF build should be evaluated from its own code rather than assuming all upstream features exist in the browser version.

### Public references reviewed (accessed 2026-10-28)

- Christine Wireless, **Tactical Key Management Device (TKMD)**: https://christinewireless.com/tactical-key-management-device-tkmd/
- Christine Wireless, **TKMD Web Page Description (2025)**: https://christinewireless.com/wp-content/uploads/2025/01/TKMD_Web_Page_Description_01_08_2025.pdf
- KFDtool source repository: https://github.com/KFDtool/KFDtool
- KFDweb source repository: https://github.com/grover556/KFDweb
- KFDtool hardware catalog: https://store.kfdtool.com/collections/all

The public references above describe KFDtool/KFDweb and TKMD capabilities at a product level; they do not establish that openKMF has been tested against every listed device or that a specific proprietary KMF protocol is available for implementation.

### KFDpro note

“KFDpro” is retained here as the project owner's stated target/interface. The public sources reviewed did not resolve that exact product name to a vendor-published specification. Before building a protocol adapter, add the exact manufacturer/model, supported software/firmware versions, container format version, connection mode, and relevant authorized interface documentation to the project sources.
