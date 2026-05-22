import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function usage() {
  console.error('Usage: node scripts/lookup-pincode.mjs <6-digit-pincode>');
  process.exit(2);
}

const pincode = (process.argv[2] ?? '').replace(/\D/g, '');
if (!/^\d{6}$/.test(pincode)) usage();

const master = require('../data/master/pincode-master.json');
const hit = master[pincode];

if (!hit) {
  console.log(`No match for ${pincode}`);
  process.exit(1);
}

console.log(JSON.stringify(hit, null, 2));

