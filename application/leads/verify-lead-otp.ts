import type { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';

export type VerifyLeadOtpParams = {
  phone: string;
  otp: string;
  requestId: string;
};

export class VerifyLeadCreationOtp {
  constructor(private readonly ds: EsafLeadsDatasource) {}

  execute(params: VerifyLeadOtpParams) {
    return this.ds.verifyLeadCreationOtp(params);
  }
}

