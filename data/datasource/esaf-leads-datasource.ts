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
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/fetch-lead/1.0`;

    console.log('[esaf-leads] fetchLeads start');

    const token = await getEsafAccessToken();

    console.log('[esaf-leads] fetchLeads response', token);

    const response = await httpJson<EsafFetchLeadsResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'API',
        externalReferencePrefix: 'API-12309946299324567-122880',
      }),
      body: JSON.stringify(dto),
    });

    console.log('[esaf-leads] fetchLeads response', response);
    return response;
  }

  async createLead(dto: EsafCreateLeadRequestDto) {

    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/lead-creation/1.0`;

    return httpJson<EsafCreateLeadResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'API',
        externalReferencePrefix: 'AB12CD34-12303080412334567-122856',
      }),
      body: JSON.stringify(dto),
    });
  }
}
