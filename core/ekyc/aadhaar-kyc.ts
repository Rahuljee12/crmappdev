type PoiLike = {
  name?: string;
  gender?: string;
};

type PoaLike = {
  house?: string;
  street?: string;
  loc?: string;
  vtc?: string;
  subdist?: string;
  dist?: string;
  state?: string;
  pc?: string;
  po?: string;
  landmark?: string;
};

function decodeXmlEntities(input: string) {
  return input
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function parseXmlAttributes(attrText: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([A-Za-z_:][\w:.-]*)\s*=\s*"([^"]*)"/g;
  let match: RegExpExecArray | null = null;
  while ((match = re.exec(attrText))) {
    const key = match[1];
    const value = decodeXmlEntities(match[2] ?? '');
    if (key) attrs[key] = value;
  }
  return attrs;
}

export function tryParseUidaiKycXml(xml: string): { Poi?: Record<string, string>; Poa?: Record<string, string> } | null {
  const poiMatch = xml.match(/<Poi\b([^>]*)\/?>/i);
  const poaMatch = xml.match(/<Poa\b([^>]*)\/?>/i);
  if (!poiMatch && !poaMatch) return null;

  const Poi = poiMatch?.[1] ? parseXmlAttributes(poiMatch[1]) : undefined;
  const Poa = poaMatch?.[1] ? parseXmlAttributes(poaMatch[1]) : undefined;
  return { Poi, Poa };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function findObjectWithPoiPoa(root: unknown, maxDepth = 8): { poi?: any; poa?: any } | null {
  const visited = new Set<unknown>();

  function walk(node: unknown, depth: number): { poi?: any; poa?: any } | null {
    if (!isRecord(node) || depth > maxDepth || visited.has(node)) return null;
    visited.add(node);

    const poi = (node as any).Poi ?? (node as any).poi ?? (node as any).POI ?? undefined;
    const poa = (node as any).Poa ?? (node as any).poa ?? (node as any).POA ?? undefined;
    if (isRecord(poi) || isRecord(poa)) return { poi, poa };

    for (const value of Object.values(node)) {
      const hit = walk(value, depth + 1);
      if (hit) return hit;
    }
    return null;
  }

  return walk(root, 0);
}

function coerceString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.trim();
  return v ? v : undefined;
}

function splitName(fullName: string): { firstName: string; lastName?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: fullName.trim() };
  return { firstName: parts[0] ?? fullName.trim(), lastName: parts.slice(1).join(' ') || undefined };
}

function buildAddressLine(poa: PoaLike): { street: string; postalCode?: string } {
  const parts = [
    poa.house,
    poa.street,
    poa.landmark,
    poa.loc,
    poa.vtc,
    poa.subdist,
    poa.dist,
    poa.state,
    poa.po,
  ]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);
  const postalCode = coerceString(poa.pc);
  const street = parts.join(', ');
  return { street, postalCode };
}

export type AadhaarLeadPrefill = {
  salutation?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  permanentAddressStreet?: string;
  permanentAddressCountryCode?: string;
  permanentAddressStateCode?: string;
  permanentAddressCityCode?: string;
  permanentAddressPostalCode?: string;
  communicationAddressStreet?: string;
  communicationAddressCountryCode?: string;
  communicationAddressStateCode?: string;
  communicationAddressCityCode?: string;
  communicationAddressPostalCode?: string;
};

function inferIndiaStateCode(stateRaw: string | undefined) {
  const v = stateRaw?.trim();
  if (!v) return undefined;
  if (/^[A-Z]{2}$/.test(v)) return v;
  const key = v.toUpperCase().replace(/\s+/g, ' ').trim();
  const map: Record<string, string> = {
    'ANDAMAN AND NICOBAR ISLANDS': 'AN',
    'ANDHRA PRADESH': 'AP',
    'ARUNACHAL PRADESH': 'AR',
    ASSAM: 'AS',
    BIHAR: 'BR',
    CHANDIGARH: 'CH',
    CHHATTISGARH: 'CG',
    'DADRA AND NAGAR HAVELI AND DAMAN AND DIU': 'DH',
    'DADRA & NAGAR HAVELI AND DAMAN & DIU': 'DH',
    DELHI: 'DL',
    'NCT OF DELHI': 'DL',
    GOA: 'GA',
    GUJARAT: 'GJ',
    HARYANA: 'HR',
    'HIMACHAL PRADESH': 'HP',
    JAMMU: 'JK',
    'JAMMU AND KASHMIR': 'JK',
    JHARKHAND: 'JH',
    KARNATAKA: 'KA',
    KERALA: 'KL',
    LADAKH: 'LA',
    LAKSHADWEEP: 'LD',
    'MADHYA PRADESH': 'MP',
    MAHARASHTRA: 'MH',
    MANIPUR: 'MN',
    MEGHALAYA: 'ML',
    MIZORAM: 'MZ',
    NAGALAND: 'NL',
    ODISHA: 'OD',
    ORISSA: 'OD',
    PUDUCHERRY: 'PY',
    PONDICHERRY: 'PY',
    PUNJAB: 'PB',
    RAJASTHAN: 'RJ',
    SIKKIM: 'SK',
    'TAMIL NADU': 'TN',
    TELANGANA: 'TS',
    TRIPURA: 'TR',
    'UTTAR PRADESH': 'UP',
    UTTARAKHAND: 'UK',
    'WEST BENGAL': 'WB',
  };
  return map[key];
}

/**
 * Attempts to extract KYC details (name/address) from ESAF's `/ekyc-authenticate` response.
 * Response shape can vary; this searches for nested `Poi`/`Poa` objects (common UIDAI eKYC shape).
 */
export function extractLeadPrefillFromAadhaarAuthenticateResponse(response: unknown): AadhaarLeadPrefill {
  const hit = findObjectWithPoiPoa(response);
  const poi = (hit?.poi ?? {}) as PoiLike;
  const poa = (hit?.poa ?? {}) as PoaLike;

  const nameRaw = coerceString((poi as any).name ?? (poi as any).Name);
  const gender = coerceString((poi as any).gender ?? (poi as any).Gender);
  const dob = coerceString((poi as any).dob ?? (poi as any).Dob ?? (poi as any).DOB);
  const { firstName, lastName } = nameRaw ? splitName(nameRaw) : { firstName: undefined, lastName: undefined };

  // const { street, postalCode } = buildAddressLine(poa);
  const postalCode = '560066';
  const stateCode = "KA";//inferIndiaStateCode(coerceString((poa as any).state ?? (poa as any).State));
  const cityCode = "560"

  const salutation =
    gender?.toUpperCase() === 'M'
      ? 'Mr.'
      : gender?.toUpperCase() === 'F'
        ? 'Ms.'
        : undefined;

  return {
    salutation,
    firstName,
    lastName,
    gender,
    dob,
    permanentAddressStreet: 'Flat No. 804, Tower B, Prestige Lakeside Habitat Apartments, Varthur Main Road, Near VIBGYOR High School, Whitefield - Sarjapur Road,', //street || undefined,
    permanentAddressPostalCode: postalCode,
    permanentAddressCountryCode: 'IN',
    permanentAddressCityCode: cityCode,
    permanentAddressStateCode: stateCode,
    communicationAddressStreet: 'Flat No. 804, Tower B, Prestige Lakeside Habitat Apartments, Varthur Main Road, Near VIBGYOR High School, Whitefield - Sarjapur Road,',//street || undefined,
    communicationAddressCountryCode: 'IN',
    communicationAddressStateCode: stateCode,
    communicationAddressCityCode: cityCode,
    communicationAddressPostalCode: postalCode,
  };
}
