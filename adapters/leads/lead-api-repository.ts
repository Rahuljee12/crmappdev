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

    // const defaultStateCode = this.required(
    //   process.env.EXPO_PUBLIC_ESAF_DEFAULT_STATE_CODE,
    //   'EXPO_PUBLIC_ESAF_DEFAULT_STATE_CODE',
    // );
    // const defaultCityCode = this.required(
    //   process.env.EXPO_PUBLIC_ESAF_DEFAULT_CITY_CODE,
    //   'EXPO_PUBLIC_ESAF_DEFAULT_CITY_CODE',
    // );
    // const defaultCountryCode =
    //   process.env.EXPO_PUBLIC_ESAF_DEFAULT_COUNTRY_CODE ?? 'IN';

    // const permanentAddressStreet = params.permanentAddressStreet ?? '';
    // const permanentAddressPostalCode = params.permanentAddressPostalCode ?? '';
    // const communicationAddressStreet =
    //   params.communicationAddressStreet ?? params.permanentAddressStreet;
    // const communicationAddressPostalCode =
    //   params.communicationAddressPostalCode ?? params.permanentAddressPostalCode;

    await this.ds.createLead({
      request: {
    salutation: 'Mrs.',
    firstName: 'Avni',
    lastName: 'Sharma',

        category: 'I',
    leadSource: 'Cold Call',
    leadJobTitle: 'Manager',

        mobileNumber: params.mobileNumber,
        mobileCountryCode,

    officePhone: '6522367250',
    officePhoneCountryCode: '91',

    emailAddress: 'kokotest@gmail.com',

    homeBranchCode: '1155',

    leadInterestedProduct: 'SA',
    productCode: '3008',

        companyName: '',

        lcEmpCode,
        lgEmpCode,

    permanentAddressStreet:
      'Flat No. 804, Tower B, Prestige Lakeside Habitat Apartments, Varthur Main Road, Near VIBGYOR High School, Whitefield - Sarjapur Road,',

    permanentAddressCountryCode: 'IN',
    permanentAddressStateCode: 'KA',

    // IMPORTANT:
    // use same valid city code from working fetch response
    permanentAddressCityCode: '248120',

    permanentAddressPostalCode: '560066',

    communicationAddressStreet:
      'Flat No. 804, Tower B, Prestige Lakeside Habitat Apartments, Varthur Main Road, Near VIBGYOR High School, Whitefield - Sarjapur Road,',

    communicationAddressStreet2: 'Ramgondanahalli',

    communicationAddressStreet3: 'Whitefield',

    communicationAddressCountryCode: 'IN',
    communicationAddressStateCode: 'KA',

    communicationAddressCityCode: '248120',

    communicationAddressPostalCode: '560066',

    cDigiPin: '804B5600',
    pDigiPin: 'G7X4-K9R2',

    campaignCode: 'A1345',

    panNumber: 'DSFTA7621L',

    leadDescription:
      'The Lead is a Manager in ARKEA Group of Advertisers Pvt Ltd. He has been with the firm for 12 years. He is part of some of the prestigious projects for their firm. He has goodwill among peers, colleagues and employers.',

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
  }
}
