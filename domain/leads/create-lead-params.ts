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
  permanentAddressPostalCode?: string;

  // Communication address (Aadhaar e-KYC)
  communicationAddressStreet?: string;
  communicationAddressPostalCode?: string;
};
