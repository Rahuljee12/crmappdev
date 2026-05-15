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
import {
  requireEkycAuthenticateTransactionInfo,
  requireEkycGenerateOtpTransactionInfo,
} from '@/core/ekyc/ekyc-config';

type OtpSendResponseDto = {
  request_id?: string;
  received_time?: string;
  event?: string;
  response?: {
    sms?: {
      status?: string;
      destination?: string;
      msg_id?: string;
    };
  };
  _message?: string;
  request_count?: number;
  error?: number;
};

type OtpVerifyResponseDto = {
  status?: string;
  response?: unknown;
  request_id?: string;
  error?: unknown;
};

type AadhaarGenerateOtpResponseDto = {
  data?: {
    version?: string;
    timestamp?: string;
    externalReferenceNumber?: string;
    channel?: string;
  };
  response?: {
    transactionInfo?: {
      rrn?: string;
      responseCode?: string;
      responseMsg?: string;
    };
    otpResponse?: {
      ret?: string;
      err?: string;
      ts?: string;
      txn?: string;
    };
  };
  status?: {
    statusCode?: string;
    statusMessage?: string;
    source?: string;
  }[];
};

type AadhaarAuthenticateResponseDto = {
  data?: {
    version?: string;
    timestamp?: string;
    externalReferenceNumber?: string;
    channel?: string;
  };
  response?: unknown;
  status?: {
    statusCode?: string;
    statusMessage?: string;
    source?: string;
  }[];
};

type PanValidationResponseDto = {
  data?: {
    version?: string;
    timestamp?: string;
    externalReferenceNumber?: string;
    channel?: string;
  };
  response?: unknown;
  status?: {
    statusCode?: string;
    statusMessage?: string;
    source?: string;
  }[];
};

export class EsafLeadsDatasource {
  private readonly DEFAULT_RD_META = {
    rdsId: 'L1.PRECISION.WIN.001',
    rdsVer: '1.2.3',
    dpId: 'PRECISION.PB',
    mi: 'PB1000',
    mc: 'MIIEKjCCAxKgAwIBAgIIbHT+sxs479YwDQYJKoZIhvcNAQELBQAwgf4xNzA1BgNVBAMTLkRTIFBSRUNJU0lPTiBCSU9NRVRSSUMgSU5ESUEgUFJJVkFURSBMSU1JVEVEIDYxJzAlBgNVBDMTHk5vICAyMiBIYWJpYnVsbGFoIFJvYWQgVCBOYWdhcjEQMA4GA1UECRMHQ2hlbm5haTETMBEGA1UECBMKVGFtaWwgTmFkdTEyMDAGA1UECxMpUFJFQ0lTSU9OIEJJT01FVFJJQyBJTkRJQSBQUklWQVRFIExJTUlURUQxMjAwBgNVBAoTKVBSRUNJU0lPTiBCSU9NRVRSSUMgSU5ESUEgUFJJVkFURSBMSU1JVEVEMQswCQYDVQQGEwJJTjAeFw0yNjAxMTAxMDEzNTRaFw0yNjAyMDkxMDEzNTRaMG4xEjAQBgNVBAMMCVByZWNpc2lvbjEQMA4GA1UEBwwHQ0hFTk5BSTESMBAGA1UECwwJQmlvbWV0cmljMTIwMAYDVQQKDClQcmVjaXNpb24gQmlvbWV0cmljIEluZGlhIFByaXZhdGUgTGltaXRlZDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKs1l21Kg9VqgAqLIl1pLUiNIVOcKmqgq0ZCIUIUQ7wfT0n2ZnfXEVv0awNmsx1eLX+JFBqGVSXUexzAF9jKpg7Lm666ygxWgUdAW/iP2WZzQ/ooQzMNopo52D75GQlAV38JpxVFWC865oRluTC/aHlOEzv6JbW4AXhrn9k8AC8V9xN1+lX4EKXICG6nnCIxrKoRLnij/l+hRXpDRA8NkfUPHI2WEPTGoRmo5VKELqJRIaF5BPwET7zo4nkOvOunAqP1kxMwm9onByXUtFDdDF3zLCjegmsQjKSt5dCsK/WF1AEMePthjgzBjPSWP8XxeUUvaGYdSmPlzPT6BXS1gtUCAwEAAaM7MDkwCQYDVR0TBAIwADALBgNVHQ8EBAMCAYYwHwYDVR0jBBgwFoAUSyV+2fSpBryOVAaRNbi1sGuU/rIwDQYJKoZIhvcNAQELBQADggEBAEsxGh0ZfW6TMeBImKedHN7qAlVGSa8g24ti2mIfOmRI6xMXQ0we6O8+d6aoMMJCdokg5gWkNcD2Vi7no7rhj8dT7RDL130zRg6ZE9Fv8AJBa83YoFJDzFxs0Sf1ilqhB7Qvny9VjQCN/6BRMV1mfqY7yMVhra7eBvEiNdtQqO3hlIZXGw/R5vazeZ0sWt/vYKLmf+os5cR/+oLBS2+5cGhsORKbyJtr8b0cBcwZHTaR1NDMVrIYHNjOY+JfpBOSvkX/8GAM/ke/+YMG0+RQcKh1kIvQm5qB2pglenvkjz0HfwNBIGKmEyX5c0ah3ZTkEbSd3YdVPaBFxbqHoQE75/g=',
  };

  private pickOrDefault(value: string | undefined, fallback: string) {
    const v = value?.trim();
    return v ? v : fallback;
  }

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

  async sendLeadCreationOtp(dto: {
    phone: string;
    channel?: string;
    externalReferenceNumber?: string;
  }): Promise<OtpSendResponseDto> {
    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/event/otp`;

    const response = await httpJson<OtpSendResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: dto.channel ?? 'AOCO',
        externalReferencePrefix: dto.externalReferenceNumber ?? 'API-12309946299324567-122880',
      }),
      body: JSON.stringify({
        event: 'AOCO_ACCOUNT_OPENING_OTP',
        to: { phone: dto.phone },
      }),
    });

    return response;
  }

  async verifyLeadCreationOtp(dto: {
  phone: string;
  otp: string;
  requestId: string;
  }): Promise<OtpVerifyResponseDto> {

  const token = await getEsafAccessToken();

  const url =
    `${requireEsafApiBaseUrl()}/int/mcrm/verify/validate` +
    `?otp=${encodeURIComponent(dto.otp)}` +
    `&request_id=${encodeURIComponent(dto.requestId)}`;

  return httpJson<OtpVerifyResponseDto>(url, {
    method: 'POST',
    headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'API',
        externalReferencePrefix: 'API-12309946299324567-122880',
      }),
  });
}

  async generateAadhaarOtp(dto: { encryptedUid: string }): Promise<AadhaarGenerateOtpResponseDto> {
    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/ekyc-generate-otp/1.0`;
    const transactionInfo = requireEkycGenerateOtpTransactionInfo();

    return httpJson<AadhaarGenerateOtpResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'API',
        externalReferencePrefix: 'ABCDEF-11001119121096189-123161',
      }),
      body: JSON.stringify({
        request: {
          transactionInfo,
          otp: {
            uid: dto.encryptedUid,
            type: 'A',
            opts: { ch: '01' },
          },
        },
      }),
    });
  }

  async validatePan(dto: {
    pan: string;
    name: string;
    fathername: string;
    dob: string; // YYYY-MM-DD
  }): Promise<PanValidationResponseDto> {
    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/pan-validation/1.0`;

    return httpJson<PanValidationResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'API',
        externalReferencePrefix: 'API-20951270120036789-123458',
      }),
      body: JSON.stringify({
        request: {
          inputData: [
            {
              pan: dto.pan,
              name: dto.name,
              fathername: dto.fathername,
              dob: dto.dob,
            },
          ],
        },
      }),
    });
  }

 async authenticateAadhaarOtp(dto: {
    encryptedUid: string;
    txn: string;
    auth?: {
      skey?: { ci?: string; value?: string };
      data?: { type?: string; value?: string };
      hmac?: string;
    };
    uses?: {
      pi?: 'y' | 'n';
      pa?: 'y' | 'n';
      pfa?: 'y' | 'n';
      bio?: 'y' | 'n';
      pin?: 'y' | 'n';
      otp?: 'y' | 'n';
      bt?: string;
    };
    tid?: string;
    meta?: {
      rdsId?: string;
      rdsVer?: string;
      dpId?: string;
      dc?: string;
      mi?: string;
      mc?: string;
    };
  }): Promise<AadhaarAuthenticateResponseDto> {
    const token = await getEsafAccessToken();
    const url = `${requireEsafApiBaseUrl()}/int/mcrm/ekyc-authenticate/1.0`;
    const transactionInfo = requireEkycAuthenticateTransactionInfo();

    const skeyCi = dto.auth?.skey?.ci;
    const skeyValue = dto.auth?.skey?.value;
    const dataType = dto.auth?.data?.type;
    const dataValue = dto.auth?.data?.value;
    const hmacValue = dto.auth?.hmac;

    if (!skeyCi || !skeyValue || !dataType || !dataValue || !hmacValue) {
      throw new Error(
        'Missing Aadhaar auth parameters (skey/data/hmac). Generate them client-side using the UIDAI certificate before calling authenticate.',
      );
    }

    const response = httpJson<AadhaarAuthenticateResponseDto>(url, {
      method: 'POST',
      headers: buildEsafHeaders({
        bearerToken: token,
        channel: 'API',
        externalReferencePrefix: 'ABCDEF-20119180716741079-123456',
      }),
      body: JSON.stringify({
        request: {
          transactionInfo,
          auth: {
            uid: dto.encryptedUid,
            tid: dto.tid ?? '',
            txn: dto.txn,
            uses: {
              pi: dto.uses?.pi ?? 'n',
              pa: dto.uses?.pa ?? 'n',
              pfa: dto.uses?.pfa ?? 'n',
              bio: dto.uses?.bio ?? 'n',
              pin: dto.uses?.pin ?? 'n',
              otp: dto.uses?.otp ?? 'y',
              ...(dto.uses?.bt ? { bt: dto.uses.bt } : null),
            },
            meta: {
              rdsId: dto.meta?.rdsId ?? '',
              rdsVer: dto.meta?.rdsVer ?? '',
              dpId: dto.meta?.dpId ?? '',
              dc: dto.meta?.dc ?? '',
              mi: dto.meta?.mi ?? '',
              mc: dto.meta?.mc ?? '',
            },
            skey: {
              ci: skeyCi,
              value: skeyValue,
            },
            data: {
              type: dataType,
              value: dataValue,
            },
            hmac: hmacValue,
          },
        },
      }),
    });
    console.log("Aadhar details:",response)
    return response;

  }
}
