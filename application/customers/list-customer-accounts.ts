import type { EsafCustomerDatasource } from '@/data/datasource/esaf-customer-datasource';
import { mapEsafCustomerAccountsToDomain } from '@/data/mapper/customer-account.mapper';
import type { CustomerAccount } from '@/domain/customers/customer-account';

export class ListCustomerAccounts {
  constructor(private readonly ds: EsafCustomerDatasource) {}

  async execute(customerId: string): Promise<CustomerAccount[]> {
    const normalizedCustomerId = Number(customerId);

    if (!Number.isFinite(normalizedCustomerId) || normalizedCustomerId <= 0) {
      return [];
    }

    const response = await this.ds.fetchLightWeightCustomerView(normalizedCustomerId);
    return mapEsafCustomerAccountsToDomain(response.xfaceAccountDetailsforCustomerDTO);
  }
}
