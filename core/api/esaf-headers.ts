import { ESAF_DEFAULT_CHANNEL } from './esaf-config';

export function buildEsafHeaders(params: {
  channel?: string;
  externalReferencePrefix?: string;
  bearerToken?: string;
}) {
  const channel = params.channel ?? ESAF_DEFAULT_CHANNEL;
  const externalReferenceNumber =
    params.externalReferencePrefix ?? 'API-12309946299324567-122880';

  const headers: Record<string, string> = {
    channel,
    'external-reference-number': externalReferenceNumber,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (params.bearerToken) {
    headers['x-apim-auth'] = `Bearer ${params.bearerToken}`;
  }

  return headers;
}
