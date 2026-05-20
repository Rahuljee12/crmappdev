import type { CustomerAccountDetails } from '@/domain/customers/customer-account-details';

import type { EsafLightWeightAccountViewResponseDto } from '../dto/esaf-account-view.dto';

type AccountViewDto = NonNullable<EsafLightWeightAccountViewResponseDto['xfaceAccountDetailsforCustomerDTO']>[number];

function trimText(value?: string) {
  return value?.trim() ?? '';
}

function digitsOnly(value?: string) {
  return trimText(value).replace(/\D/g, '');
}

function formatAccountNumber(value?: string) {
  const digits = digitsOnly(value);
  if (!digits) return '—';
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
}

function formatDateText(value?: string) {
  const digits = digitsOnly(value);
  if (digits.length !== 8) return '—';

  const year = Number(digits.slice(0, 4));
  const monthIndex = Number(digits.slice(4, 6)) - 1;
  const day = digits.slice(6, 8);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (!months[monthIndex]) return '—';

  return `${day} ${months[monthIndex]} ${year}`;
}

function formatRate(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return '—';
  }

  return `${value.toFixed(2)}% p.a.`;
}

function deriveStatus(account?: AccountViewDto) {
  if (!account) return '—';
  if (trimText(account.accountCloseDate) && trimText(account.accountCloseDate) !== '18000101') {
    return 'Closed';
  }
  if (trimText(account.flgBlocked) === 'Y') {
    return 'Blocked';
  }
  return 'Active';
}

export function mapEsafLightWeightAccountToDomain(
  dto: EsafLightWeightAccountViewResponseDto,
): CustomerAccountDetails | null {
  const account = dto.xfaceAccountDetailsforCustomerDTO?.[0];
  if (!account) return null;

  const customer = dto.xfaceCustomerResponseDTO;

  return {
    accountHolder: trimText(customer?.customerFullName) || trimText(account.accountTitle) || '—',
    accountNumber: formatAccountNumber(account.accountId),
    availableBalance:
      typeof account.availableBalanace === 'number' ? account.availableBalanace : null,
    branchCode: trimText(account.branchCode) || '—',
    branchName: trimText(account.branchName) || '—',
    ifscCode: trimText(account.ifscCode) || '—',
    interestRate: formatRate(account.ratInt),
    modeOfOperation: trimText(account.modeOfOperation) || '—',
    nominee: 'Not Registered',
    openedOn: formatDateText(account.datAcctOpen),
    productCategory: trimText(account.productCategory) || '—',
    productName: trimText(account.productName) || 'Account',
    statementCycle: trimText(account.frequency) || '—',
    status: deriveStatus(account),
  };
}
