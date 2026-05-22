import fs from 'node:fs';
import path from 'node:path';

import XLSX from 'xlsx';

function usage() {
  console.error('Usage: node scripts/generate-pincode-master.mjs <input.xlsx> <output.json>');
  process.exit(2);
}

const inputXlsx = process.argv[2];
const outputJson = process.argv[3];
if (!inputXlsx || !outputJson) usage();

const workbook = XLSX.readFile(inputXlsx);
const firstSheetName = workbook.SheetNames[0];
if (!firstSheetName) throw new Error('No sheets found in workbook');

const sheet = workbook.Sheets[firstSheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

/**
 * Output shape is optimized for fast runtime lookup:
 * {
 *   "560066": { cityCode, stateCode, cityName, district, districtCode, stateName, latitude, longitude }
 * }
 */
const map = {};

for (const row of rows) {
  const pincode = String(row['Pincode'] ?? '').trim();
  if (!pincode || !/^[0-9]{6}$/.test(pincode)) continue;

  const cityCode = String(row['City Code'] ?? '').trim();
  const stateCode = String(row['State Code'] ?? '').trim();
  if (!cityCode || !stateCode) continue;

  map[pincode] = {
    pincode,
    cityName: String(row['City Name'] ?? '').trim() || undefined,
    cityCode,
    district: String(row['District'] ?? '').trim() || undefined,
    districtCode: String(row['District Code'] ?? '').trim() || undefined,
    stateName: String(row['StateName'] ?? '').trim() || undefined,
    stateCode,
    latitude: row['Latitude'] === '' ? undefined : Number(row['Latitude']),
    longitude: row['Longitude'] === '' ? undefined : Number(row['Longitude']),
  };
}

fs.mkdirSync(path.dirname(outputJson), { recursive: true });
fs.writeFileSync(outputJson, JSON.stringify(map, null, 2) + '\n', 'utf8');

console.log(`Wrote ${Object.keys(map).length} pincodes to ${outputJson}`);
