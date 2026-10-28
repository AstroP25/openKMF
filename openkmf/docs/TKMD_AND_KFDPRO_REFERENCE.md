# KFDpro and TKMD — Reference Notes

This document separates project-owner context from publicly documented product information. It is a planning reference, not a statement of tested interoperability.

## KFDpro

### Project-owner context

The project owner describes KFDpro as supporting the openKMF container workflow and a Motorola KMF-facing IP interface, alongside other Motorola KVL IP or SLIP connection paths depending on model. This makes KFDpro a candidate integration target for openKMF's container/transfer architecture.

### What remains to be confirmed

The public references reviewed for this project did not provide an authoritative specification for a product with the exact name “KFDpro.” Before implementation, identify:

- manufacturer and exact model/product name;
- hardware and firmware/software version;
- whether “container support” means native EKC import, DKF import, another container format, or transfer of selected keys;
- the IP/SLIP transport, protocol documentation, authentication/session behavior, and supported operations;
- whether a supported API or test environment is available.

Do not infer that the open-source KFDtool KFD100, KFDShield, KFDMicro, KFDnano, or KFDpico are the same product as “KFDpro.” The supplied KFDtool-AVR README names those devices, not a KFDpro model.

## Christine Wireless Tactical Key Management Device (TKMD)

### Publicly described capabilities

Christine Wireless's product page describes TKMD as a compact P25 KMF for tactical/smaller deployments. It states that TKMD can access radio infrastructure through a direct cable to supported base-station equipment or through IP to TIA-standard DFSI base stations. It also describes a browser-based setup/provisioning interface and autonomous operation after setup.

The same product page states that TKMD:

- can generate AES-256 and DES-OFB key material using its internal random-number generator;
- can send and receive encrypted key files for remote TKMD updates;
- can accept key material from KVL-3000+ and KVL-4000 and other key-fill devices;
- can export locally generated key material to TIA-standard key-fill devices;
- can exchange encrypted files between networked TKMD units;
- supports OTAR functions including Hello, Zeroize, Keyset Change, Warm Start, Key Modify, and Key Delete;
- maintains subscriber/radio information and status through its web interface.

Primary reference: https://christinewireless.com/tactical-key-management-device-tkmd/

The vendor also publishes a 2025 web-page description PDF with more implementation-oriented product details: https://christinewireless.com/wp-content/uploads/2025/01/TKMD_Web_Page_Description_01_08_2025.pdf

### Relevance to openKMF

TKMD is a useful comparison for the tactical operating model: compact/local deployment, a browser-oriented administration experience, key-fill-device interchange, and (in the TKMD product itself) OTAR capabilities. It should not be treated as evidence that openKMF can use the same interfaces or protocols without additional documentation and testing.

Potential staged evaluation:

1. **Documented key-fill interchange** — determine which specific file/container or TWI/MR-Emulator workflows are supported between the target TKMD model and the available openKMF hardware.
2. **TWI compatibility test** — establish the exact cable/adapter, device mode, command subset, and firmware combination. Do not infer support solely from general “KFD” language.
3. **File-based exchange** — identify the exact encrypted file format and version, and test with synthetic keys. Do not assume a TKMD-specific encrypted file is the same as an EKC or DKF.
4. **OTAR** — keep separate from file interchange and local key fill. Evaluate only when the specific interface, authorization, infrastructure, and test setup are known.

### Confidence boundaries

The feature list above is a summary of vendor-published material, not an independent test report. Actual interface details and model-specific compatibility must be confirmed with the vendor documentation and a controlled test environment.

## Useful public references

- TKMD product page: https://christinewireless.com/tactical-key-management-device-tkmd/
- TKMD 2025 web-page description PDF: https://christinewireless.com/wp-content/uploads/2025/01/TKMD_Web_Page_Description_01_08_2025.pdf
- KFDtool source repository: https://github.com/KFDtool/KFDtool
- KFDweb source repository: https://github.com/grover556/KFDweb
- KFDtool hardware catalog: https://store.kfdtool.com/collections/all
