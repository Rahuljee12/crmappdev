import type { CustomerAccount } from '@/domain/customers/customer-account';

import type { EsafCustomerAccountDto } from '../dto/esaf-customer-view.dto';

function trimText(value?: string) {
  return value?.trim() ?? '';
}

function formatMaturityBadge(account: EsafCustomerAccountDto) {
  const closeDate = trimText(account.accountCloseDate);
  if (closeDate && closeDate !== '18000101') {
    return { badge: 'Closed', badgeVariant: 'amber' as const };
  }

  const maturityDate = trimText(account.datMaturity);
  if (maturityDate && maturityDate !== '18000101' && maturityDate.length >= 4) {
    return {
      badge: `Matures ${maturityDate.slice(0, 4)}`,
      badgeVariant: 'green' as const,
    };
  }

  return { badge: 'Active', badgeVariant: 'green' as const };
}

export function mapEsafCustomerAccountsToDomain(
  accounts: EsafCustomerAccountDto[] | undefined,
): CustomerAccount[] {
  return (accounts ?? [])
    .map((account) => {
      const productName = trimText(account.productName);
      const accountId = trimText(account.accountId);

      if (!productName && !accountId) {
        return null;
      }

      const badge = formatMaturityBadge(account);

      return {
        productName: productName || 'Account',
        accountId: accountId || '—',
        badge: badge.badge,
        badgeVariant: badge.badgeVariant,
      };
    })
    .filter((account): account is CustomerAccount => Boolean(account));
}
