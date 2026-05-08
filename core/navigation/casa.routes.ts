export const casaOpenPath = '/(casa)/open/[step]' as const;



export type CasaOpenStep =
  | 'identify'
  | 'kyc'
  | 'review'
  | 'submit';

export type CasaAccountType =
  | 'Savings'
  | 'Current'
  | 'FD'
  | 'RD';

export function casaOpenStepParams({
  step,
  type,
}: {
  step: CasaOpenStep | string;
  type: CasaAccountType | string;
}): { step: string; type: string } {
  return {
    step: String(step),
    type: String(type),
  };
}

export function openCasaOpenStepArgs({
  step,
  type,
}: {
  step: CasaOpenStep | string;
  type: CasaAccountType | string;
}): {
  pathname: typeof casaOpenPath;
  params: { step: string; type: string };
} {
  return {
    pathname: casaOpenPath,
    params: casaOpenStepParams({ step, type }),
  };
}


