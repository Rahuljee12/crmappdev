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

    await this.ds.createLead({
      request: {
        salutation: params.salutation,
        firstName: params.firstName,
        lastName: params.lastName,
        category: 'I',
        leadSource: params.leadSource,
        mobileNumber: params.mobileNumber,
        mobileCountryCode,
        emailAddress: params.emailAddress,
        homeBranchCode,
        leadInterestedProduct: params.interestedProduct,
        productCode: params.productCode,
        lcEmpCode,
        lgEmpCode,
      },
    });
  }
}
