import type { Lead } from '@/domain/leads/lead';
import type { LeadRepository } from '@/domain/leads/lead-repository';
import type { CreateLeadParams } from '@/domain/leads/create-lead-params';
import type { LeadListCriteria } from '@/domain/leads/lead-list-criteria';

import { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';
import { mapEsafLeadsToDomain } from '@/data/mapper/lead.mapper';
import { lookupByPincode } from '@/data/master/pincode-master';

export class LeadApiRepository implements LeadRepository {
  constructor(private readonly ds: EsafLeadsDatasource) {}

  private required(value: string | undefined, name: string) {
    if (!value) throw new Error(`Missing env: ${name}`);
    return value;
  }

  private trimOrUndefined(value: string | undefined) {
    const v = value?.trim();
    return v ? v : undefined;
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

  async createLead(params: CreateLeadParams): Promise<string> {
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

    const defaultCountryCode = this.trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_DEFAULT_COUNTRY_CODE);
    const defaultStateCode = this.trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_DEFAULT_STATE_CODE);
    const defaultCityCode = this.trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_DEFAULT_CITY_CODE);
    const defaultPostalCode = this.trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_DEFAULT_POSTAL_CODE);

    const salutation = this.trimOrUndefined(params.salutation);
    const firstName = this.trimOrUndefined(params.firstName);
    const lastName = this.trimOrUndefined(params.lastName);
    const emailAddress = this.trimOrUndefined(params.emailAddress);
    const panNumber = this.trimOrUndefined(params.panNumber);
    const fatherName = this.trimOrUndefined(params.fatherName);
    const dob = this.trimOrUndefined(params.dob);

    const permanentAddressStreet = this.trimOrUndefined(params.permanentAddressStreet);
    const permanentAddressPostalCode = this.trimOrUndefined(params.permanentAddressPostalCode);
    const communicationAddressStreet = this.trimOrUndefined(params.communicationAddressStreet);
    const communicationAddressPostalCode = this.trimOrUndefined(params.communicationAddressPostalCode);

    const hasAnyAddress =
      !!permanentAddressStreet ||
      !!permanentAddressPostalCode ||
      !!communicationAddressStreet ||
      !!communicationAddressPostalCode;

    const leadDescriptionParts = [
      panNumber ? `PAN:${panNumber}` : undefined,
      fatherName ? `FATHER:${fatherName}` : undefined,
      dob ? `DOB:${dob}` : undefined,
      hasAnyAddress && (permanentAddressPostalCode || communicationAddressPostalCode)
        ? `PIN:${permanentAddressPostalCode || communicationAddressPostalCode}`
        : undefined,
    ].filter(Boolean);
    const leadDescription = leadDescriptionParts.length ? leadDescriptionParts.join(' | ') : undefined;

    const request: Parameters<EsafLeadsDatasource['createLead']>[0]['request'] = {
      salutation,
      firstName,
      lastName,

      category: 'I',
      leadSource: params.leadSource,
      leadJobTitle: 'Manager',

      mobileNumber: params.mobileNumber,
      mobileCountryCode,

      officePhone: '6522367250',
      officePhoneCountryCode: '91',

      emailAddress,
      panNumber,

      homeBranchCode,

      leadInterestedProduct: params.interestedProduct,
      productCode: params.productCode,

      companyName: '',

      lcEmpCode,
      lgEmpCode,

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
    };

    if (hasAnyAddress) {
      const mergedCommunicationAddressStreet = communicationAddressStreet || permanentAddressStreet;
      const mergedCommunicationAddressPostalCode =
        communicationAddressPostalCode || permanentAddressPostalCode;

      const permanentPostalHit = lookupByPincode(permanentAddressPostalCode);
      const communicationPostalHit = lookupByPincode(mergedCommunicationAddressPostalCode);

      const permanentAddressCountryCode =
        this.trimOrUndefined(params.permanentAddressCountryCode) || defaultCountryCode;
      const permanentAddressStateCode =
        this.trimOrUndefined(params.permanentAddressStateCode) ||
        permanentPostalHit?.stateCode ||
        defaultStateCode;
      const permanentAddressCityCode =
        this.trimOrUndefined(params.permanentAddressCityCode) ||
        permanentPostalHit?.cityCode ||
        defaultCityCode;

      const communicationAddressCountryCode =
        this.trimOrUndefined(params.communicationAddressCountryCode) || permanentAddressCountryCode;
      const communicationAddressStateCode =
        this.trimOrUndefined(params.communicationAddressStateCode) ||
        communicationPostalHit?.stateCode ||
        permanentAddressStateCode;
      const communicationAddressCityCode =
        this.trimOrUndefined(params.communicationAddressCityCode) ||
        communicationPostalHit?.cityCode ||
        permanentAddressCityCode;

      const permanentAddressStreet2 =
        permanentPostalHit?.district || permanentPostalHit?.cityName || undefined;
      const permanentAddressStreet3 = permanentPostalHit?.stateName || undefined;
      const communicationAddressStreet2 =
        communicationPostalHit?.district ||
        communicationPostalHit?.cityName ||
        permanentAddressStreet2;
      const communicationAddressStreet3 =
        communicationPostalHit?.stateName || permanentAddressStreet3;

      if (permanentAddressPostalCode && !permanentPostalHit) {
        throw new Error(`Pincode ${permanentAddressPostalCode} not found in pincode master`);
      }
      if (mergedCommunicationAddressPostalCode && !communicationPostalHit) {
        throw new Error(
          `Pincode ${mergedCommunicationAddressPostalCode} not found in pincode master`,
        );
      }
      if (permanentAddressPostalCode && (!permanentAddressStateCode || !permanentAddressCityCode)) {
        throw new Error(
          `Unable to resolve state/city code for pincode ${permanentAddressPostalCode}`,
        );
      }
      if (
        mergedCommunicationAddressPostalCode &&
        (!communicationAddressStateCode || !communicationAddressCityCode)
      ) {
        throw new Error(
          `Unable to resolve state/city code for pincode ${mergedCommunicationAddressPostalCode}`,
        );
      }

      request.permanentAddressStreet = permanentAddressStreet;
      request.permanentAddressStreet2 = permanentAddressStreet2;
      request.permanentAddressStreet3 = permanentAddressStreet3;
      request.permanentAddressCountryCode = permanentAddressCountryCode;
      request.permanentAddressStateCode = permanentAddressStateCode;
      request.permanentAddressCityCode = permanentAddressCityCode;
      request.permanentAddressPostalCode = permanentAddressPostalCode ?? defaultPostalCode;

      request.communicationAddressStreet = mergedCommunicationAddressStreet;
      request.communicationAddressStreet2 = communicationAddressStreet2;
      request.communicationAddressStreet3 = communicationAddressStreet3;
      request.communicationAddressCountryCode = communicationAddressCountryCode;
      request.communicationAddressStateCode = communicationAddressStateCode;
      request.communicationAddressCityCode = communicationAddressCityCode;
      request.communicationAddressPostalCode = mergedCommunicationAddressPostalCode ?? defaultPostalCode;
    }

    const response = await this.ds.createLead({ request });

    const statusCode = response?.status?.[0]?.statusCode?.trim() ?? '';
    if (statusCode && statusCode !== '000') {
      const statusMessage =
        response?.status?.[0]?.statusMessage?.trim() || 'Lead creation failed';
      throw new Error(statusMessage);
    }

    return response?.status?.[0]?.statusMessage?.trim() || 'Lead created successfully';
  }
}
