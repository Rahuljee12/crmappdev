import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function readParam(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

const p12Path = readParam('EKYC_P12_PATH', 'assets/certificates/sit_consumer-to-esb_aeskey.p12');
const p12Password = readParam('EKYC_P12_PASSWORD', '');
const alias = readParam('EKYC_KEY_ALIAS', 'sit_consumer-to-esb_aeskey');
const keyPassword = readParam('EKYC_KEY_PASSWORD', '');

const javaFile = 'scripts/ExtractEkycAesKeyFromP12.java';
const javaClass = 'scripts/ExtractEkycAesKeyFromP12.class';

if (!existsSync(javaClass)) {
  execFileSync('javac', [javaFile], { stdio: 'inherit' });
}

const base64 = execFileSync(
  'java',
  ['-cp', 'scripts', 'ExtractEkycAesKeyFromP12', p12Path, p12Password, alias, keyPassword],
  { encoding: 'utf8' },
).trim();

process.stdout.write(base64);

