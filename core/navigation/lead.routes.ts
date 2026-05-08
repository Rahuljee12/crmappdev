export const leadModalPath = '/modal' as const;


export function newLeadModalArgs(): {
  pathname: typeof leadModalPath;
  params?: Record<string, never>;
} {
  return { pathname: leadModalPath };
}

