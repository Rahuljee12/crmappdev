import type { CustomerSearchResult } from '@/domain/customers/customer-search-result';
import type { EsafCustomerMatchDto, EsafFindCustomerResponseDto } from '../dto/esaf-customer.dto';

function trimText(value?: string) {
  return value?.trim() ?? '';
}

function isNoCustomerResponse(dto: EsafFindCustomerResponseDto) {
  const statusCode = trimText(dto.status?.statusCode);
  const statusMessage = trimText(dto.status?.statusMessage);

  return statusCode === '303' || statusMessage === 'RequestId Already Exists';
}

function formatSubtitle(match: EsafCustomerMatchDto) {
  const parts = [
    trimText(match.ucic) ? `UCIC ${trimText(match.ucic)}` : '',
    trimText(match.customerId) ? `Customer ${trimText(match.customerId)}` : '',
    trimText(match.recordType),
    trimText(match.matchType),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'Customer match';
}

function mapCustomerMatch(match: EsafCustomerMatchDto): CustomerSearchResult | null {
  const name = trimText(match.name);
  const phone1 = trimText(match.phone1);
  const customerId = trimText(match.customerId);
  const ucic = trimText(match.ucic);

  if (!name && !phone1 && !customerId && !ucic) {
    return null;
  }

  const details = [
    trimText(match.email1),
    trimText(match.address1),
    trimText(match.address2),
    trimText(match.city1),
    trimText(match.state1),
    trimText(match.pinCode1),
  ].filter(Boolean);

  return {
    name: name || 'Unknown customer',
    phone1: phone1 || '—',
    customerId: customerId || '—',
    ucic: ucic || '—',
    recordType: trimText(match.recordType) || '—',
    customerType: trimText(match.customerType) || '—',
    matchType: trimText(match.matchType) || '—',
    statusMessage: trimText(match.statusMessage) || '—',
    sourceSystem: trimText(match.sourceSystem) || '—',
    matchCount: trimText(match.matchCount) || '—',
    subtitle: formatSubtitle(match),
    details,
  };
}

export function mapEsafCustomerToDomain(
  dto: EsafFindCustomerResponseDto,
): CustomerSearchResult[] {
  if (isNoCustomerResponse(dto)) {
    return [];
  }

  const matches = dto.response?.customerMatches ?? [];
  return matches
    .filter((match) => trimText(match.recordType) !== 'INPUT')
    .map(mapCustomerMatch)
    .filter((match): match is CustomerSearchResult => Boolean(match));
}
