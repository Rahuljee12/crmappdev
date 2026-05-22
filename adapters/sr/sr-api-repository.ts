import type { CreateSrParams } from '@/domain/sr/create-sr-params';
import type { CreateSrResult, SrRepository } from '@/domain/sr/sr-repository';

import { EsafSrDatasource } from '@/data/datasource/esaf-sr-datasource';

function required(value: string, name: string) {
  const v = value.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

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

function formatNstpExternalReferenceNo(now = new Date()) {
  const suffix = String(now.getTime()).slice(-8);
  return `SRSIT${suffix}`;
}

export class SrApiRepository implements SrRepository {
  constructor(private readonly ds: EsafSrDatasource) {}

  async createServiceRequest(params: CreateSrParams): Promise<CreateSrResult> {
    if (params.type === 'PAN_UPDATION') {
      const cifId = required(params.cifId, 'cif id');
      const panNumber = required(params.panNumber, 'pan number');
      const fileName = required(params.document.fileName, 'document file name');
      const fileContentBase64 = required(params.document.fileContentBase64, 'document base64');

      const now = new Date();
      const externalReferenceNo = formatNstpExternalReferenceNo(now);
      const dto = await this.ds.createCustomerNstpServiceRequest({
        externalReferenceNo,
        cifId,
        srKey: 'SRCN002',
        description: 'PAN Updation request',
        srParams: {
          panNumber,
          panStatus: 'E',
          operativePAN: 'Y',
          panNameMatching: 'Y',
          panfatherNameMatching: 'Y',
          panDOBMatching: 'Y',
        },
        documents: [{ fileName, fileContent: fileContentBase64 }],
      });

      const status = String((dto as any)?.status ?? '').trim().toLowerCase();
      if (status && status !== 'success') {
        throw new Error((dto as any)?.statusMessage || 'Service request creation failed');
      }

      return {
        serviceRequestNumber: externalReferenceNo,
        dateCreated: formatDateCreated(now),
        statusMessage: (dto as any)?.statusMessage ?? (dto as any)?.status ?? 'success',
      };
    }

    if (params.type === 'AADHAAR_UPDATION') {
      const cifId = required(params.cifId, 'cif id');
      const aadhaarNumber = required(params.aadhaarNumber, 'aadhaar number');
      const fileName = required(params.document.fileName, 'document file name');
      const fileContentBase64 = required(params.document.fileContentBase64, 'document base64');

      const now = new Date();
      const externalReferenceNo = formatNstpExternalReferenceNo(now);
      const dto = await this.ds.createCustomerNstpServiceRequest({
        externalReferenceNo,
        cifId,
        srKey: 'SRCN002',
        description: 'Aadhaar Updation request',
        srParams: { aadhaarNumber },
        documents: [{ fileName, fileContent: fileContentBase64 }],
      });

      const status = String((dto as any)?.status ?? '').trim().toLowerCase();
      if (status && status !== 'success') {
        throw new Error((dto as any)?.statusMessage || 'Service request creation failed');
      }

      return {
        serviceRequestNumber: externalReferenceNo,
        dateCreated: formatDateCreated(now),
        statusMessage: (dto as any)?.statusMessage ?? (dto as any)?.status ?? 'success',
      };
    }

    if (params.type === 'ISSUE_CERTIFICATE_UPDATION') {
      const cifId = required(params.cifId, 'cif id');
      const certificateRef = required(params.certificateRef, 'certificate reference');
      const fileName = required(params.document.fileName, 'document file name');
      const fileContentBase64 = required(params.document.fileContentBase64, 'document base64');

      const now = new Date();
      const externalReferenceNo = formatNstpExternalReferenceNo(now);
      const dto = await this.ds.createCustomerNstpServiceRequest({
        externalReferenceNo,
        cifId,
        srKey: 'SRCN002',
        description: 'Issue Certificate Updation request',
        srParams: { certificateRef },
        documents: [{ fileName, fileContent: fileContentBase64 }],
      });

      const status = String((dto as any)?.status ?? '').trim().toLowerCase();
      if (status && status !== 'success') {
        throw new Error((dto as any)?.statusMessage || 'Service request creation failed');
      }

      return {
        serviceRequestNumber: externalReferenceNo,
        dateCreated: formatDateCreated(now),
        statusMessage: (dto as any)?.statusMessage ?? (dto as any)?.status ?? 'success',
      };
    }

    if (params.type !== 'CHEQUE_BOOK_REQUEST') {
      throw new Error('Only Cheque Book Request / NSTP update requests are supported right now.');
    }

    const accountNumber = required(params.accountNumber, 'account number');
    const cifId = required(params.cifId, 'cif id');

    const dto = await this.ds.createStpServiceRequest({
      request: {
        accountNumber,
        cifId,
        dateCreated: '',
        requestNumber: '',
        srKey: 'SRA007',
        srParams: {
          noOfLeaves: params.noOfLeaves,
          noOfChqBooks: '1',
          chequeBookType: '42',
        },
        srStatus: 'New',
      },
    });

    const statusCode = dto?.status?.[0]?.statusCode?.trim() ?? '';
    const statusMessage = dto?.status?.[0]?.statusMessage?.trim() ?? undefined;
    if (statusCode && statusCode !== '000') {
      throw new Error(statusMessage || 'Service request creation failed');
    }

    const serviceRequestNumber = dto?.response?.serviceRequestNumber?.trim();
    if (!serviceRequestNumber) {
      throw new Error('Missing serviceRequestNumber in response');
    }

    return {
      serviceRequestNumber,
      dateCreated: dto?.response?.dateCreated ?? undefined,
      statusMessage,
    };
  }
}
