import type { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';

export type FetchAadhaarDetailsParams = {
  encryptedUid: string;
  txn: string;
  auth: {
    skey: { ci: string; value: string };
    data: { type: string; value: string };
    hmac: string;
  };
};

export class FetchAadhaarDetails {
  constructor(private readonly ds: EsafLeadsDatasource) {}

  execute(params: FetchAadhaarDetailsParams) {
    return this.ds.authenticateAadhaarOtp({
      encryptedUid: params.encryptedUid,
      txn: params.txn,
      auth: params.auth,
      tid: 'registered',
      uses: {
        // Request KYC details (PI/PA) using OTP auth.
        pi: 'y',
        pa: 'y',
        pfa: 'n',
        bio: 'n',
        pin: 'n',
        otp: 'y',
      },
    });
  }
}

