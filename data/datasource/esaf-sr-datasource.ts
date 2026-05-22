import { requireEsafApiBaseUrl } from '@/core/api/esaf-config';
import { httpJson } from '@/core/api/http-json';
import { getEsafAccessToken } from '@/core/api/esaf-token-provider';

import type {
  EsafCreateCustomerNstpSrRequestDto,
  EsafCreateCustomerNstpSrResponseDto,
  EsafCreateStpSrRequestDto,
  EsafCreateStpSrResponseDto,
} from '@/data/dto/esaf-sr.dto';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function formatDateCreated(now = new Date()) {
  return (
    String(now.getFullYear()) +
    pad2(now.getMonth() + 1) +
    pad2(now.getDate()) +
    pad2(now.getHours()) +
    pad2(now.getMinutes()) +
    pad2(now.getSeconds())
  );
}

function formatExternalReferenceNumber(now = new Date()) {
  const base =
    String(now.getFullYear()) +
    pad2(now.getMonth() + 1) +
    pad2(now.getDate()) +
    pad2(now.getHours()) +
    pad2(now.getMinutes()) +
    pad2(now.getSeconds()) +
    String(now.getMilliseconds()).padStart(3, '0');

  const suffix = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  return `ERIB-${base}-${suffix}`;
}

function formatDateCreatedMillis(now = new Date()) {
  return (
    String(now.getFullYear()) +
    pad2(now.getMonth() + 1) +
    pad2(now.getDate()) +
    pad2(now.getHours()) +
    pad2(now.getMinutes()) +
    pad2(now.getSeconds()) +
    String(now.getMilliseconds()).padStart(3, '0')
  );
}

export class EsafSrDatasource {
  async createStpServiceRequest(payload: EsafCreateStpSrRequestDto): Promise<EsafCreateStpSrResponseDto> {
    const baseUrl = requireEsafApiBaseUrl();
    const url = new URL('/int/mcrm/create-stp-sr/1.0', baseUrl).toString();
    const token = await getEsafAccessToken();

    const now = new Date();
    const externalReferenceNumber = formatExternalReferenceNumber(now);

    const body: EsafCreateStpSrRequestDto = {
      request: {
        ...payload.request,
        dateCreated: payload.request.dateCreated || formatDateCreated(now),
        requestNumber: payload.request.requestNumber || `CRM${Date.now()}`, //"CRM1779284550433" 
      },
    };

    return httpJson<EsafCreateStpSrResponseDto>(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        channel: 'ERIB',
        operation: 'CRM_CREATE_REQUEST',
        'external-reference-number': externalReferenceNumber,
        'x-apim-auth': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }

  async createCustomerNstpServiceRequest(
    payload: Omit<
      EsafCreateCustomerNstpSrRequestDto,
      'externalReferenceNo' | 'dateCreated' | 'dateUpdated' | 'channelId'
    > & { externalReferenceNo?: string; dateCreated?: string; dateUpdated?: string; channelId?: string },
  ): Promise<EsafCreateCustomerNstpSrResponseDto> {
    const baseUrl = requireEsafApiBaseUrl();
    const url = new URL('/int/mcrm/create-customer-nstpsr/1.0', baseUrl).toString();
    const token = await getEsafAccessToken();

    const now = new Date();
    const externalReferenceNo = payload.externalReferenceNo || formatExternalReferenceNumber(now);
    const dateCreated = payload.dateCreated || formatDateCreatedMillis(now);
    const dateUpdated = payload.dateUpdated || dateCreated;
    const channelId = payload.channelId || 'RMBK';

    const body: EsafCreateCustomerNstpSrRequestDto = {
      externalReferenceNo,
      channelId,
      srKey: payload.srKey,
      cifId: payload.cifId,
      description: payload.description,
      dateCreated,
      dateUpdated,
      srParams: payload.srParams,
      documents: payload.documents,
    };

    return httpJson<EsafCreateCustomerNstpSrResponseDto>(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        channel: channelId,
        operation: 'CRM_CREATE_REQUEST',
        'external-reference-number': externalReferenceNo,
        'x-apim-auth': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }
}
