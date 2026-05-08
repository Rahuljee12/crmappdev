export type CustomerTabKey =
  | 'Accounts'
  | 'Leads'
  | 'Insights';

export const customerTabPaths = {
  Accounts: '/accounts' as const,
  Leads: '/' as const,
  Insights: '/customers' as const,
} as const;



export function customerTabPath(tab: CustomerTabKey):
  | typeof customerTabPaths.Accounts
  | typeof customerTabPaths.Leads
  | typeof customerTabPaths.Insights {
  return customerTabPaths[tab];
}

