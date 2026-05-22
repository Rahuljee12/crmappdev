export type PincodeMasterEntry = {
  pincode: string;
  cityName?: string;
  cityCode: string;
  district?: string;
  districtCode?: string;
  stateName?: string;
  stateCode: string;
  latitude?: number;
  longitude?: number;
};

let cached: Record<string, PincodeMasterEntry> | null = null;

function getMaster(): Record<string, PincodeMasterEntry> {
  if (cached) return cached;
  // Keep this as a local relative require so Metro can bundle the JSON.
  cached = require('./pincode-master.json') as Record<string, PincodeMasterEntry>;
  return cached;
}

export function normalizeIndianPincode(raw: string | undefined): string | undefined {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (digits.length !== 6) return undefined;
  return digits;
}

export function lookupByPincode(pincodeRaw: string | undefined): PincodeMasterEntry | undefined {
  const pincode = normalizeIndianPincode(pincodeRaw);
  if (!pincode) return undefined;
  return getMaster()[pincode];
}
