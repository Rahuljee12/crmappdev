import forge from 'node-forge';

import { getUidaiCertCi } from './ekyc-config';
import { UIDAI_PRE_PROD_ENC_CERT_20280825_PEM } from './uidai-cert';

type UidaiSkey = { ci: string; value: string };
type UidaiData = { type: 'X'; value: string };

export type UidaiOtpAuthBlock = {
  skey: UidaiSkey;
  data: UidaiData;
  hmac: string;
};

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

function certificateFromPem(pem: string) {
  return forge.pki.certificateFromPem(pem);
}

function formatTsForPid(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-` +
    `${pad(now.getMonth() + 1)}-` +
    `${pad(now.getDate())}T` +
    `${pad(now.getHours())}:` +
    `${pad(now.getMinutes())}:` +
    `${pad(now.getSeconds())}`
  );
}

function buildPidXml(otp: string, ts: string) {
  const ver = '2.0';
  // Keep output aligned with the legacy Java generator.
  return `<Pid ts="${ts}" ver ="${ver}" wadh =""><Pv otp="${otp}" /></Pid>`;
}

function deriveGcmParamsFromTs(ts: string) {
  const tsBytes = forge.util.encodeUtf8(ts);
  const nonceLen = 12;
  const aadLen = 16;
  if (tsBytes.length < aadLen) {
    throw new Error(`UIDAI ts too short for GCM params: ${ts}`);
  }
  return {
    nonce: tsBytes.slice(tsBytes.length - nonceLen),
    aad: tsBytes.slice(tsBytes.length - aadLen),
    tsBytes,
  };
}

function aesGcmEncryptWithTsPrefix(plaintextUtf8: string, keyBytes: string, ts: string) {
  const { nonce, aad, tsBytes } = deriveGcmParamsFromTs(ts);
  const cipher = forge.cipher.createCipher('AES-GCM', keyBytes);
  cipher.start({ iv: nonce, additionalData: aad, tagLength: 128 });
  cipher.update(forge.util.createBuffer(plaintextUtf8, 'utf8'));
  const ok = cipher.finish();
  if (!ok) throw new Error('UIDAI PID encryption failed');
  const encrypted = cipher.output.getBytes() + cipher.mode.tag.getBytes();
  return tsBytes + encrypted;
}

function aesGcmEncryptBytes(plaintextBytes: string, keyBytes: string, ts: string) {
  const { nonce, aad } = deriveGcmParamsFromTs(ts);
  const cipher = forge.cipher.createCipher('AES-GCM', keyBytes);
  cipher.start({ iv: nonce, additionalData: aad, tagLength: 128 });
  cipher.update(forge.util.createBuffer(plaintextBytes));
  const ok = cipher.finish();
  if (!ok) throw new Error('UIDAI HMAC encryption failed');
  return cipher.output.getBytes() + cipher.mode.tag.getBytes();
}

function sha256HexBytes(plaintextUtf8: string) {
  const md = forge.md.sha256.create();
  md.update(plaintextUtf8, 'utf8');
  const digestBytes = md.digest().getBytes();
  return forge.util.bytesToHex(digestBytes);
}

/**
 * Generates UIDAI OTP auth block values compatible with the legacy Java
 * `PidBlockGenerator_Old` + `Encrypter` implementation:
 * - Session key: random 256-bit AES key
 * - `skey.value`: RSA/PKCS#1 v1.5 encrypt(sessionKey) using UIDAI cert public key
 * - `data.value`: base64(ts + AES-GCM(pidXml, key, nonce/aad derived from ts))
 * - `hmac`: base64(AES-GCM(sha256(pidXml) bytes, key, nonce/aad derived from ts))
 */
export async function generateUidaiOtpAuthBlock(params: {
  otp: string;
  ci?: string;
  now?: Date;
}): Promise<UidaiOtpAuthBlock> {
  const ci = params.ci ?? getUidaiCertCi();
  const ts = formatTsForPid(params.now);
  const pidXml = buildPidXml(params.otp, ts);

  const sessionKeyBytes = getRandomBytes(32); // 256-bit

  const cert = certificateFromPem(UIDAI_PRE_PROD_ENC_CERT_20280825_PEM);
  const publicKey = cert.publicKey as any;

  const encSessionKeyBytes = publicKey.encrypt(sessionKeyBytes, 'RSAES-PKCS1-V1_5');

  const dataBytes = aesGcmEncryptWithTsPrefix(pidXml, sessionKeyBytes, ts);

  const shaHex = sha256HexBytes(pidXml);
  const shaHexBytes = forge.util.hexToBytes(shaHex);
  const hmacEncBytes = aesGcmEncryptBytes(shaHexBytes, sessionKeyBytes, ts);

  return {
    skey: { ci, value: forge.util.encode64(encSessionKeyBytes) },
    data: { type: 'X', value: forge.util.encode64(dataBytes) },
    hmac: forge.util.encode64(hmacEncBytes),
  };
}
