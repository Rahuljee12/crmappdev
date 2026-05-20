import type { Lead } from '@/domain/leads/lead';
import type { LeadRepository } from '@/domain/leads/lead-repository';
import type { CreateLeadParams } from '@/domain/leads/create-lead-params';
import type { LeadListCriteria } from '@/domain/leads/lead-list-criteria';

import { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';
import { mapEsafLeadsToDomain } from '@/data/mapper/lead.mapper';

export class LeadApiRepository implements LeadRepository {
  constructor(private readonly ds: EsafLeadsDatasource) {}

  private required(value: string | undefined, name: string) {
    if (!value) throw new Error(`Missing env: ${name}`);
    return value;
  }

  async listLeads(criteria: LeadListCriteria): Promise<Lead[]> {
    const dto = await this.ds.fetchLeads({
      request: {
        mobileNumber: criteria.mobileNumber,
        emailAddress: criteria.emailAddress,
        interestedProduct: criteria.interestedProduct,
      },
    });
    return mapEsafLeadsToDomain(dto);
  }

  async createLead(params: CreateLeadParams): Promise<void> {
    const homeBranchCode = this.required(
      process.env.EXPO_PUBLIC_ESAF_HOME_BRANCH_CODE,
      'EXPO_PUBLIC_ESAF_HOME_BRANCH_CODE',
    );
    const lcEmpCode = this.required(
      process.env.EXPO_PUBLIC_ESAF_LC_EMP_CODE,
      'EXPO_PUBLIC_ESAF_LC_EMP_CODE',
    );
    const lgEmpCode = this.required(
      process.env.EXPO_PUBLIC_ESAF_LG_EMP_CODE,
      'EXPO_PUBLIC_ESAF_LG_EMP_CODE',
    );
    const mobileCountryCode =
      process.env.EXPO_PUBLIC_ESAF_MOBILE_COUNTRY_CODE ?? '91';

    const defaultStateCode =
      process.env.EXPO_PUBLIC_ESAF_DEFAULT_STATE_CODE ?? "KA";
    
    const defaultCityCode =
      process.env.EXPO_PUBLIC_ESAF_DEFAULT_CITY_CODE ?? "560";
      
    const defaultCountryCode =
      process.env.EXPO_PUBLIC_ESAF_DEFAULT_COUNTRY_CODE ?? 'IN';
    const defaultPostalCode =
      process.env.EXPO_PUBLIC_ESAF_DEFAULT_POSTAL_CODE ?? '560066';

    const salutation = params.salutation?.trim() || undefined;
    const firstName = params.firstName?.trim() || undefined;
    const lastName = params.lastName?.trim() || undefined;
    const emailAddress = params.emailAddress?.trim() || undefined;
    const panNumber = params.panNumber?.trim() || undefined;
    const fatherName = params.fatherName?.trim() || undefined;
    const dob = params.dob?.trim() || undefined;

    const permanentAddressStreet = params.permanentAddressStreet?.trim() || undefined;
    const permanentAddressPostalCode = params.permanentAddressPostalCode?.trim() || undefined;
    const communicationAddressStreet =
      params.communicationAddressStreet?.trim() || permanentAddressStreet;
    const communicationAddressPostalCode =
      params.communicationAddressPostalCode?.trim() || permanentAddressPostalCode;

    const permanentAddressCountryCode =
      params.permanentAddressCountryCode?.trim() || defaultCountryCode;
    const permanentAddressStateCode =
      params.permanentAddressStateCode?.trim() || defaultStateCode;
    const permanentAddressCityCode =
      params.permanentAddressCityCode?.trim() || defaultCityCode;

    const communicationAddressCountryCode =
      params.communicationAddressCountryCode?.trim() || permanentAddressCountryCode;
    const communicationAddressStateCode =
      params.communicationAddressStateCode?.trim() || permanentAddressStateCode;
    const communicationAddressCityCode =
      params.communicationAddressCityCode?.trim() || permanentAddressCityCode;

    const leadDescriptionParts = [
      panNumber ? `PAN:${panNumber}` : undefined,
      fatherName ? `FATHER:${fatherName}` : undefined,
      dob ? `DOB:${dob}` : undefined,
      permanentAddressPostalCode ? `PIN:${permanentAddressPostalCode}` : undefined,
    ].filter(Boolean);
    const leadDescription = leadDescriptionParts.length ? leadDescriptionParts.join(' | ') : undefined;

    const response = await this.ds.createLead({
      request: {
        salutation,
        firstName,
        lastName,

        category: 'I',
        leadSource: 'Cold Call',
        leadJobTitle: 'Manager',

        mobileNumber: params.mobileNumber,
        mobileCountryCode,

        officePhone: '6522367250',
        officePhoneCountryCode: '91',

        emailAddress: "kokotest@gmail.com",
        panNumber: "DSFTA7621L",

        homeBranchCode,

        leadInterestedProduct: params.interestedProduct,
        productCode: params.productCode,

        companyName: '',

        lcEmpCode,
        lgEmpCode,

        permanentAddressStreet:
          permanentAddressStreet ??
          'Flat No. 804, Tower B, Prestige Lakeside Habitat Apartments, Varthur Main Road, Near VIBGYOR High School, Whitefield - Sarjapur Road,',

        permanentAddressStreet2: 'Ramgondanahalli',
        permanentAddressStreet3: 'Whitefield',
        permanentAddressCountryCode,
        permanentAddressStateCode,
        permanentAddressCityCode,
        permanentAddressPostalCode: permanentAddressPostalCode ?? defaultPostalCode,

        communicationAddressStreet:
          communicationAddressStreet ??
          'Flat No. 804, Tower B, Prestige Lakeside Habitat Apartments, Varthur Main Road, Near VIBGYOR High School, Whitefield - Sarjapur Road,',

        communicationAddressStreet2: 'Ramgondanahalli',

        communicationAddressStreet3: 'Whitefield',

        communicationAddressCountryCode,
        communicationAddressStateCode,
        communicationAddressCityCode,
        communicationAddressPostalCode: communicationAddressPostalCode ?? defaultPostalCode,

        cDigiPin: '804B5600',
        pDigiPin: 'G7X4-K9R2',

        campaignCode: 'A1345',
        leadDescription,

        caObsRefId: '',
        caMinBalance: '',
        caOppStatus: '',

        saObsRefId: 'SA8432211',
        saMinBalance: '5000.00',
        saOppStatus: 'Open',

        plObsRefId: '',
        plOppAmount: '',
        plOppStatus: '',

        aulObsRefId: '',
        aulOppAmount: '',
        aulOppStatus: '',

        dsglObsRefId: '',
        dsglOppAmount: '',
        dsglOppStatus: '',

        mlObsRefId: '',
        mlOppAmount: '',
        mlOppStatus: '',

        fdObsRefId: '',
        fdOppAmount: '',
        fdOppStatus: '',

        rdObsRefId: '',
        rdOppAmount: '',
        rdOppStatus: '',

        odObsRefId: '',
        odOppAmount: '',
        odOppStatus: '',

        alObsRefId: '',
        alOppAmount: '',
        alOppStatus: '',

        msmeObsRefId: '',
        msmeOppAmount: '',
        msmeOppStatus: '',

        molObsRefId: '',
        molOppAmount: '',
        molOppStatus: '',
      },
    });

    const statusCode = response?.status?.[0]?.statusCode?.trim() ?? '';
    if (statusCode && statusCode !== '000') {
      const statusMessage =
        response?.status?.[0]?.statusMessage?.trim() || 'Lead creation failed';
      throw new Error(statusMessage);
    }
  }
}
