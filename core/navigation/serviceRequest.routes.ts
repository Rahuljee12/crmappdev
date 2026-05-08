export const serviceRequestDashboardPath = '/sr' as const;


export function serviceRequestDashboardArgs(): {
  pathname: typeof serviceRequestDashboardPath;
} {
  return { pathname: serviceRequestDashboardPath };
}


