import type { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';

export type GenerateAadhaarOtpParams = {
  encryptedUid: string;
};

export class GenerateAadhaarOtp {
  constructor(private readonly ds: EsafLeadsDatasource) {}

  execute(params: GenerateAadhaarOtpParams) {
    return this.ds.generateAadhaarOtp(params);
  }
}

