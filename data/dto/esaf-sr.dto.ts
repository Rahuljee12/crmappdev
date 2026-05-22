export type EsafCreateStpSrRequestDto = {
  request: {
    accountNumber: string;
    cifId: string;
    dateCreated: string; // YYYYMMDDHHmmss
    requestNumber: string;
    srKey: string;
    srParams: Record<string, string>;
    srStatus: string;
  };
};

export type EsafCreateStpSrResponseDto = {
  data?: {
    version?: string;
    timestamp?: string;
    externalReferenceNumber?: string;
    channel?: string;
  };
  response?: {
    requestNumber?: string;
    serviceRequestNumber?: string;
    dateCreated?: string;
    dateUpdated?: string | null;
  };
  status?: {
    statusCode?: string;
    statusMessage?: string;
    source?: string;
  }[];
};

export type EsafCreateCustomerNstpSrRequestDto = {
  externalReferenceNo: string;
  channelId: string;
  srKey: string;
  cifId: string;
  description: string;
  dateCreated: string; // YYYYMMDDHHmmssSSS (as per sample)
  dateUpdated: string; // YYYYMMDDHHmmssSSS
  srParams: Record<string, string>;
  documents: {
    fileName: string;
    fileContent: string; // base64
  }[];
};

export type EsafCreateCustomerNstpSrResponseDto = {
  status?: string;
  statusMessage?: string;
  data?: unknown;
  response?: unknown;
};
