import forge from 'node-forge';

import { requireEkycAesKey } from '@/core/security/ekyc-secure-storage';

const AES_KEY_HELP =
  'Initialize the EKYC AES key at runtime (stored in SecureStore). You can generate it from the PKCS#12 using: EKYC_P12_PASSWORD=... EKYC_KEY_PASSWORD=... npm run ekyc:print-aes-key';

function getRandomBytes(length: number) {
  const cryptoObj = (globalThis as unknown as { crypto?: any }).crypto;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    return String.fromCharCode(...Array.from(bytes));
  }

  try {
    return forge.random.getBytesSync(length);
  } catch {
    return String.fromCharCode(
      ...Array.from({ length }, () => Math.floor(Math.random() * 256)),
    );
  }
}

export async function encryptAadhaarUid(uidPlaintext: string) {
  const keyBase64 = await requireEkycAesKey();
  const keyBytes = forge.util.decode64(keyBase64);
  const keyLen = keyBytes.length;
  if (keyLen !== 16 && keyLen !== 24 && keyLen !== 32) {
    throw new Error(
      `Invalid EKYC AES key length: ${keyLen} bytes (expected 16/24/32). ${AES_KEY_HELP}`,
    );
  }
  const iv = getRandomBytes(12);

  const cipher = forge.cipher.createCipher('AES-GCM', keyBytes);
  cipher.start({ iv, tagLength: 128 });
  cipher.update(forge.util.createBuffer(uidPlaintext, 'utf8'));
  const success = cipher.finish();
  if (!success) throw new Error('Failed to encrypt Aadhaar UID');

  const encryptedBytes = iv + cipher.output.getBytes() + cipher.mode.tag.getBytes();
  return forge.util.encode64(encryptedBytes);
}

export async function encryptEkycValue(valuePlaintext: string) {
  const keyBase64 = await requireEkycAesKey();
  const keyBytes = forge.util.decode64(keyBase64);
  const keyLen = keyBytes.length;
  if (keyLen !== 16 && keyLen !== 24 && keyLen !== 32) {
    throw new Error(
      `Invalid EKYC AES key length: ${keyLen} bytes (expected 16/24/32). ${AES_KEY_HELP}`,
    );
  }

  const iv = getRandomBytes(12);
  const cipher = forge.cipher.createCipher('AES-GCM', keyBytes);
  cipher.start({ iv, tagLength: 128 });
  cipher.update(forge.util.createBuffer(valuePlaintext, 'utf8'));
  const success = cipher.finish();
  if (!success) throw new Error('Failed to encrypt EKYC value');

  const encryptedBytes = iv + cipher.output.getBytes() + cipher.mode.tag.getBytes();
  return forge.util.encode64(encryptedBytes);
}
