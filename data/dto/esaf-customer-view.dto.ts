export type EsafLightWeightCustomerViewRequestDto = {
  args0: {
    bankCode: number;
    channel: string;
    externalReferenceNo: string;
    serviceCode: string;
    transactionBranch: number;
    userId: string;
    postingDateText: string;
  };
  args1: {
    customerId: number;
  };
};

export type EsafCustomerAccountDto = {
  DPD?: number;
  NPA?: string;
  accountCloseDate?: string;
  accountId?: string;
  accountTitle?: string;
  availableBalanace?: number;
  balPrincipal?: number;
  balanceBook?: number;
  branchCode?: string;
  classification?: string;
  codDepNo?: number;
  currencyCode?: number;
  currencyShortName?: string;
  currentStatus?: string;
  customerRelationship?: string;
  datAcctOpen?: string;
  datMaturity?: string;
  frequency?: string;
  holdBalance?: number;
  iban?: string;
  maturityAmount?: number;
  moduleCode?: string;
  originalBalance?: number;
  overDraftLimit?: number;
  productCode?: string;
  productName?: string;
  ratInt?: number;
  unclearFunds?: number;
};

export type EsafLightWeightCustomerViewResponseDto = {
  postingDate?: string;
  transactionStatus?: {
    FCYHangeHandlingApplied?: boolean;
    errorCode?: string;
    extendedReply?: Record<string, unknown>;
    externalReferenceNo?: string;
    isOverriden?: boolean;
    isServiceChargeApplied?: boolean;
    replyCode?: number;
    spReturnValue?: number;
  };
  xfaceAccountDetailsforCustomerDTO?: EsafCustomerAccountDto[];
  xfaceCustomerResponseDTO?: {
    aadhaarReferenceNo?: string;
    bankShortName?: string;
    categoryType?: string;
    city?: string;
    country?: string;
    customerFullName?: string;
    customerId?: number;
    defAccNo?: string;
    emailAddress?: string;
    flgBlocked?: string;
    line1?: string;
    line2?: string;
    line3?: string;
    mobileNumber?: string;
    pan?: string;
    shortName?: string;
    state?: string;
    zip?: string;
  };
};
