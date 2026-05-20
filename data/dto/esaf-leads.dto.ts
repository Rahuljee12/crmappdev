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
    leadJobTitle?: string;

    mobileNumber?: string;
    mobileCountryCode?: string;

    officePhone?: string;
    officePhoneCountryCode?: string;

    emailAddress?: string;

    homeBranchCode?: string;

    leadInterestedProduct?: string;
    productCode?: string;

    companyName?: string;

    lcEmpCode?: string;
    lgEmpCode?: string;

    // Permanent Address
    permanentAddressStreet?: string;
    permanentAddressStreet2?: string;
    permanentAddressStreet3?: string;
    permanentAddressStateCode?: string;
    permanentAddressCityCode?: string;
    permanentAddressPostalCode?: string;
    permanentAddressCountryCode?: string;

    // Communication Address
    communicationAddressStreet?: string;
    communicationAddressStreet2?: string;
    communicationAddressStreet3?: string;
    communicationAddressCountryCode?: string;
    communicationAddressStateCode?: string;
    communicationAddressCityCode?: string;
    communicationAddressPostalCode?: string;

    // Digi Pin
    cDigiPin?: string;
    pDigiPin?: string;

    // Campaign
    campaignCode?: string;

    // PAN
    panNumber?: string;

    // Description
    leadDescription?: string;

    // Current Account
    caObsRefId?: string;
    caMinBalance?: string;
    caOppStatus?: string;

    // Savings Account
    saObsRefId?: string;
    saMinBalance?: string;
    saOppStatus?: string;

    // Personal Loan
    plObsRefId?: string;
    plOppAmount?: string;
    plOppStatus?: string;

    // Auto Loan
    aulObsRefId?: string;
    aulOppAmount?: string;
    aulOppStatus?: string;

    // DSG Loan
    dsglObsRefId?: string;
    dsglOppAmount?: string;
    dsglOppStatus?: string;

    // Mortgage Loan
    mlObsRefId?: string;
    mlOppAmount?: string;
    mlOppStatus?: string;

    // Fixed Deposit
    fdObsRefId?: string;
    fdOppAmount?: string;
    fdOppStatus?: string;

    // Recurring Deposit
    rdObsRefId?: string;
    rdOppAmount?: string;
    rdOppStatus?: string;

    // Overdraft
    odObsRefId?: string;
    odOppAmount?: string;
    odOppStatus?: string;

    // Agriculture Loan
    alObsRefId?: string;
    alOppAmount?: string;
    alOppStatus?: string;

    // MSME
    msmeObsRefId?: string;
    msmeOppAmount?: string;
    msmeOppStatus?: string;

    // Mortgage OD Loan
    molObsRefId?: string;
    molOppAmount?: string;
    molOppStatus?: string;
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
