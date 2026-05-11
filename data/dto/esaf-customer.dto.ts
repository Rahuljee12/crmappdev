export type EsafFindCustomerRequestDto = {
  request: {
    profileId?: string;
    clientRequestId?: string;
    name?: string;
    phone1?: string;
    aadhaar?: string;
    sourceSystem?: string;
    customerType?: string;
  };
};

export type EsafFindCustomerResponseDto = {
  response?: {
    customerMatches?: {
      name?: string;
      phone1?: string;
      customerId?: string;
      ucic?: string;
      recordType?: string;
      customerType?: string;
    }[];
  };
};

