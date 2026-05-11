export type EsafFetchLeadsRequestDto = {
  request: {
    mobileNumber?: string;
    emailAddress?: string;
    interestedProduct?: string;
  };
};

export type EsafFetchLeadsResponseDto = {
  data?: {
    timestamp?: string;
  };
  response?: {
    count?: string;
    leads?: {
      leadId?: string;
      firstName?: string;
      lastName?: string;
      mobile?: string;
      emailAddress?: string;
      productType?: string[];
      productCode?: string;
      leadSource?: string;
    }[];
  };
};

export type EsafCreateLeadRequestDto = {
  request: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    category?: string;
    leadSource?: string;
    mobileNumber?: string;
    mobileCountryCode?: string;
    emailAddress?: string;
    homeBranchCode?: string;
    leadInterestedProduct?: string;
    productCode?: string;
    lcEmpCode?: string;
    lgEmpCode?: string;
  };
};

export type EsafCreateLeadResponseDto = {
  response?: {
    leadId?: string;
    status?: string;
  };
  status?: {
    statusCode?: string;
    statusMessage?: string;
  }[];
};

