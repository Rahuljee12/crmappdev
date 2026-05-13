import type { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';

export type SendLeadOtpParams = {
  phone: string;
  channel?: string;
  externalReferenceNumber?: string;
};

export class SendLeadCreationOtp {
  constructor(private readonly ds: EsafLeadsDatasource) {}

  execute(params: SendLeadOtpParams) {
    return this.ds.sendLeadCreationOtp(params);
  }
}

