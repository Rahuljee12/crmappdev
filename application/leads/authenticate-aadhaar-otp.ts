import type { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';

export type AuthenticateAadhaarOtpParams = {
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
};

export class AuthenticateAadhaarOtp {
  constructor(private readonly ds: EsafLeadsDatasource) {}

  execute(params: AuthenticateAadhaarOtpParams) {
    return this.ds.authenticateAadhaarOtp(params);
  }
}
