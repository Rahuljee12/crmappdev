import type { Lead, LeadStatus } from '@/domain/leads/lead';
import type { EsafFetchLeadsResponseDto } from '../dto/esaf-leads.dto';

function leadStatusFromProduct(productType?: string): LeadStatus {
  if (!productType) return 'Warm';
  if (productType === 'SA') return 'Hot';
  if (productType === 'CA') return 'Warm';
  return 'Cold';
}

function productLabel(productType?: string, productCode?: string) {
  const base =
    productType === 'SA'
      ? 'Savings'
      : productType === 'CA'
        ? 'Current'
        : productType === 'FD'
          ? 'Term Deposit'
          : productType === 'RD'
            ? 'Recurring Deposit'
            : productType ?? 'Product';

  return productCode ? `${base} • ${productCode}` : base;
}

function safeName(firstName?: string, lastName?: string) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || 'Unknown';
}

export function mapEsafLeadsToDomain(dto: EsafFetchLeadsResponseDto): Lead[] {
  const leads = dto.response?.leads ?? [];
  const timestamp = dto.data?.timestamp;

  return leads.map((l) => {
    const productType = l.productType?.[0];
    return {
      name: safeName(l.firstName, l.lastName),
      product: productLabel(productType, l.productCode),
      amount: '—',
      source: l.leadSource ? `via ${l.leadSource}` : '—',
      time: timestamp ? new Date(timestamp).toLocaleString() : '—',
      status: leadStatusFromProduct(productType),
    };
  });
}
