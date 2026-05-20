export const accountDetailsPath = '/account-details' as const;

export type AccountDetailsParams = {
  customerId?: string;
  accountId: string;
  productName?: string;
};

export function accountDetailsArgs(params: AccountDetailsParams): {
  pathname: typeof accountDetailsPath;
  params: AccountDetailsParams;
} {
  return {
    pathname: accountDetailsPath,
    params,
  };
}
