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

export type EsafCustomerMatchDto = {
  customerType?: string;
  clientRequestId?: string;
  matchCount?: string;
  matchType?: string;
  name?: string;
  phone1?: string;
  recordType?: string;
  sourceSystem?: string;
  statusMessage?: string;
  customerId?: string;
  ucic?: string;
  ucictype?: string;
  customerStatus?: string;
  email1?: string;
  gender?: string;
  pan?: string;
  passport?: string;
  drivingLicense?: string;
  voterId?: string;
  aadhaar?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  address4?: string;
  addressType1?: string;
  addressType2?: string;
  addressType3?: string;
  addressType4?: string;
  city1?: string;
  city2?: string;
  state1?: string;
  pinCode1?: string;
  pinCode2?: string;
  country1?: string;
  country2?: string;
  dobdoi?: string;
  motherName?: string;
  bankAccountNumber?: string;
  ckyc?: string;
  scaleType?: string;
  dgFillerColumn1?: string;
  dgFillerColumn2?: string;
  dgFillerColumn3?: string;
  dgFillerColumn4?: string;
  dgFillerColumn5?: string;
  tan?: string;
};

export type EsafFindCustomerResponseDto = {
  data?: {
    version?: string;
    timestamp?: string;
    externalReferenceNumber?: string;
    channel?: string;
  };
  response?: {
    customerMatches?: EsafCustomerMatchDto[];
  };
  status?: {
    statusCode?: string;
    statusMessage?: string;
  };
};
