import { requireEsafApiBaseUrl } from '@/core/api/esaf-config';
import { buildEsafHeaders } from '@/core/api/esaf-headers';
import { httpJson } from '@/core/api/http-json';
import { getEsafAccessToken } from '@/core/api/esaf-token-provider';

import type {
  EsafFindCustomerRequestDto,
  EsafFindCustomerResponseDto,
} from '../dto/esaf-customer.dto';

export class EsafCustomerDatasource {
  async findCustomer(dto: EsafFindCustomerRequestDto) {
    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/find-customer/1.0`;

    return httpJson<EsafFindCustomerResponseDto>(url, {
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
