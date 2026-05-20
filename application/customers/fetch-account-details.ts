import type { EsafCustomerDatasource } from '@/data/datasource/esaf-customer-datasource';
import { mapEsafLightWeightAccountToDomain } from '@/data/mapper/account-details.mapper';
import type { CustomerAccountDetails } from '@/domain/customers/customer-account-details';

export class FetchCustomerAccountDetails {
  constructor(private readonly ds: EsafCustomerDatasource) {}

  async execute(codAcctNo: string): Promise<CustomerAccountDetails | null> {
    const normalizedCodAcctNo = codAcctNo.trim().replace(/\s+/g, '');
    if (!normalizedCodAcctNo) {
      return null;
    }

    const response = await this.ds.fetchLightWeightAccountView(normalizedCodAcctNo);
    return mapEsafLightWeightAccountToDomain(response);
  }
}
