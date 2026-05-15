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
  permanentAddressStreet?: string;
  permanentAddressPostalCode?: string;
  communicationAddressStreet?: string;
  communicationAddressPostalCode?: string;
};

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
  const { firstName, lastName } = nameRaw ? splitName(nameRaw) : { firstName: undefined, lastName: undefined };

  const { street, postalCode } = buildAddressLine(poa);

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
    permanentAddressStreet: street || undefined,
    permanentAddressPostalCode: postalCode,
    communicationAddressStreet: street || undefined,
    communicationAddressPostalCode: postalCode,
  };
}
