export const leadModalPath = '/modal' as const;

export type LeadModalParams = {
  mobile?: string;
  product?: string;
};

export function newLeadModalArgs(params?: LeadModalParams): {
  pathname: typeof leadModalPath;
  params?: LeadModalParams;
} {
  return params ? { pathname: leadModalPath, params } : { pathname: leadModalPath };
}
