import { requireEsafApiBaseUrl } from '@/core/api/esaf-config';
import { buildEsafHeaders } from '@/core/api/esaf-headers';
import { httpJson } from '@/core/api/http-json';
import { getEsafAccessToken } from '@/core/api/esaf-token-provider';

import type {
  EsafCreateLeadRequestDto,
  EsafCreateLeadResponseDto,
  EsafFetchLeadsRequestDto,
  EsafFetchLeadsResponseDto,
} from '../dto/esaf-leads.dto';

export class EsafLeadsDatasource {
  async fetchLeads(dto: EsafFetchLeadsRequestDto) {
    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/aoco/fetch-lead/1.0`;

    return httpJson<EsafFetchLeadsResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'AOCO',
        externalReferencePrefix: 'AOCO',
      }),
      body: JSON.stringify(dto),
    });
  }

  async createLead(dto: EsafCreateLeadRequestDto) {
    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/aoco/lead-creation-v1/1.0`;

    return httpJson<EsafCreateLeadResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'API',
        externalReferencePrefix: 'AB12CD34',
      }),
      body: JSON.stringify(dto),
    });
  }
}
