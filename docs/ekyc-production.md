# e-KYC (Aadhaar OTP) production setup

This app stores the AES key for Aadhaar e-KYC encryption at runtime using SecureStore.

The source of truth is the PKCS#12 keystore:

- `assets/certificates/sit_consumer-to-esb_aeskey.p12`

## Generate the AES key (no manual copy/paste)

Use the built-in extractor script (requires a JDK on the machine/CI):

```bash
EKYC_P12_PASSWORD=esbdcmssit EKYC_KEY_PASSWORD=esbdcmssit npm run ekyc:print-aes-key
```

It prints the Base64 key to stdout. Store this value securely and initialize SecureStore at runtime via `setEkycAesKey(...)`.

## Use in production builds

Do not bundle the AES key via `EXPO_PUBLIC_*` env vars. Initialize SecureStore at runtime (for example from a secure backend, MDM, or an admin-only setup screen).
