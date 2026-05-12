import { ESAF_DEFAULT_CHANNEL } from './esaf-config';

function rand4() {
  return Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, '0');
}

export function buildExternalReferenceNumber(prefix: string) {
  const now = Date.now().toString();
  return `${prefix}-${now}${rand4()}-${rand4()}`;
}

export function buildEsafHeaders(params: {
  channel?: string;
  externalReferencePrefix?: string;
  bearerToken?: string;
}) {
  const channel = params.channel ?? ESAF_DEFAULT_CHANNEL;
  const externalReferenceNumber = 'API-12309946299324567-122880';

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

