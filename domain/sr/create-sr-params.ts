export type SrType =
  | 'MOBILE_NUMBER_UPDATE'
  | 'DEBIT_CARD_NEW'
  | 'CHEQUE_BOOK_REQUEST'
  | 'PAN_UPDATION'
  | 'AADHAAR_UPDATION'
  | 'ISSUE_CERTIFICATE_UPDATION';

export type SrDocument = {
  fileName: string;
  fileContentBase64: string;
};

export type CreateSrParams =
  | {
      type: 'CHEQUE_BOOK_REQUEST';
      accountNumber: string;
      cifId: string;
      noOfLeaves: '10' | '25' | '50' | '100';
    }
  | {
      type: 'MOBILE_NUMBER_UPDATE';
      accountNumber: string;
      cifId: string;
      newMobileNumber: string;
    }
  | {
      type: 'DEBIT_CARD_NEW';
      accountNumber: string;
      cifId: string;
      variant: 'Classic' | 'Platinum' | 'Business';
    }
  | {
      type: 'PAN_UPDATION';
      cifId: string;
      panNumber: string;
      document: SrDocument;
    }
  | {
      type: 'AADHAAR_UPDATION';
      cifId: string;
      aadhaarNumber: string;
      document: SrDocument;
    }
  | {
      type: 'ISSUE_CERTIFICATE_UPDATION';
      cifId: string;
      certificateRef: string;
      document: SrDocument;
    };
