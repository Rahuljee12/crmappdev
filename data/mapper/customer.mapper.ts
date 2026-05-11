import type { ExistingCustomer } from '@/domain/customers/customer';
import type { EsafFindCustomerResponseDto } from '../dto/esaf-customer.dto';

function initialsFromName(name: string) {
  const parts = name
    .split(' ')
    .map((p) => p.trim())
    .filter(Boolean);
  return parts
    .slice(0, 3)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function mapEsafCustomerToDomain(
  dto: EsafFindCustomerResponseDto,
): ExistingCustomer | null {
  const matches = dto.response?.customerMatches ?? [];
  const best =
    matches.find((m) => m.recordType === 'ONLINE' && m.customerType === 'CUSTOMER') ??
    matches.find((m) => m.customerType === 'CUSTOMER') ??
    matches[0];

  const name = (best?.name ?? '').trim();
  const mobile = (best?.phone1 ?? '').trim();
  const cif = (best?.ucic ?? best?.customerId ?? '').trim();

  if (!name && !mobile && !cif) return null;

  return {
    name: name || 'Unknown',
    cif: cif ? `CIF-${cif}` : 'CIF-—',
    mobile: mobile || '—',
    initials: initialsFromName(name || 'U'),
    accounts: [],
    leads: [],
    insights: [],
  };
}

