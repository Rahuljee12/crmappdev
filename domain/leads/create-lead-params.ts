export type CreateLeadParams = {
  mobileNumber: string;
  leadSource: string;
  interestedProduct: string;
  productCode: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  panNumber?: string;
  fatherName?: string;
  dob?: string; // YYYY-MM-DD

  // Permanent address (Aadhaar e-KYC)
  permanentAddressStreet?: string;
  permanentAddressCountryCode?: string;
  permanentAddressStateCode?: string;
  permanentAddressCityCode?: string;
  permanentAddressPostalCode?: string;

  // Communication address (Aadhaar e-KYC)
  communicationAddressStreet?: string;
  communicationAddressCountryCode?: string;
  communicationAddressStateCode?: string;
  communicationAddressCityCode?: string;
  communicationAddressPostalCode?: string;
};
