import { requireEsafApiBaseUrl } from '@/core/api/esaf-config';
import { buildEsafHeaders } from '@/core/api/esaf-headers';
import { httpJson } from '@/core/api/http-json';
import { getEsafAccessToken } from '@/core/api/esaf-token-provider';

import type {
  EsafFindCustomerRequestDto,
  EsafFindCustomerResponseDto,
} from '../dto/esaf-customer.dto';
import type {
  EsafLightWeightAccountViewRequestDto,
  EsafLightWeightAccountViewResponseDto,
} from '../dto/esaf-account-view.dto';
import type {
  EsafLightWeightCustomerViewRequestDto,
  EsafLightWeightCustomerViewResponseDto,
} from '../dto/esaf-customer-view.dto';

function createRandomExternalReference(prefix: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';

  for (let index = 0; index < 8; index += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `${prefix}${suffix}`;
}

function formatPostingDateText(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export class EsafCustomerDatasource {
  async findCustomer(dto: EsafFindCustomerRequestDto) {
    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/find-customer/1.0`;

    return httpJson<EsafFindCustomerResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'API',
        externalReferenceNumber: 'AB12CD34-12340890067234567-122999',
      }),
      body: JSON.stringify(dto),
    });
  }

  async fetchLightWeightCustomerView(
    customerId: number,
  ): Promise<EsafLightWeightCustomerViewResponseDto> {
    const token = await getEsafAccessToken();
    const url =
      `${requireEsafApiBaseUrl()}/int/mcrm/FCAPIService/LightWeightCustomerViewService/processRequest`;
    const externalReferenceNo = createRandomExternalReference('LoanFun');
    const externalReferenceNumber = `EESB-${Date.now()}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`;

    const dto: EsafLightWeightCustomerViewRequestDto = {
      args0: {
        bankCode: 760,
        channel: 'API',
        externalReferenceNo,
        serviceCode: 'E010',
        transactionBranch: 1115,
        userId: 'SYSTELLER',
        postingDateText: formatPostingDateText(),
      },
      args1: {
        customerId,
      },
    };

    return httpJson<EsafLightWeightCustomerViewResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'EESB',
        externalReferenceNumber,
      }),
      body: JSON.stringify(dto),
    });
  }

  async fetchLightWeightAccountView(
    codAcctNo: string,
  ): Promise<EsafLightWeightAccountViewResponseDto> {
    const token = await getEsafAccessToken();
    const url =
      `${requireEsafApiBaseUrl()}/int/mcrm/FCAPIService/LightWeightAccountViewService/processRequest`;
    const externalReferenceNo = createRandomExternalReference('LoanFun');
    const externalReferenceNumber = `EESB-${Date.now()}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`;

    const dto: EsafLightWeightAccountViewRequestDto = {
      args0: {
        bankCode: 760,
        channel: 'API',
        externalReferenceNo,
        serviceCode: 'E011',
        transactionBranch: 1115,
        userId: 'SYSTELLER',
        postingDateText: formatPostingDateText(),
      },
      args1: {
        codAcctNo,
      },
    };

    return httpJson<EsafLightWeightAccountViewResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'EESB',
        externalReferenceNumber,
      }),
      body: JSON.stringify(dto),
    });
  }
}
