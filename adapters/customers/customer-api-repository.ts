import type { CustomerRepository } from '@/domain/customers/customer-repository';
import type { CustomerSearchResult } from '@/domain/customers/customer-search-result';

import { EsafCustomerDatasource } from '@/data/datasource/esaf-customer-datasource';
import { mapEsafCustomerToDomain } from '@/data/mapper/customer.mapper';

export class CustomerApiRepository implements CustomerRepository {
  constructor(private readonly ds: EsafCustomerDatasource) {}

  async findCustomerByMobile(mobile: string): Promise<CustomerSearchResult[]> {
    const profileId = process.env.EXPO_PUBLIC_ESAF_PROFILE_ID ?? '1';
    const sourceSystem = process.env.EXPO_PUBLIC_ESAF_SOURCE_SYSTEM ?? 'PRIME';
    const customerType = process.env.EXPO_PUBLIC_ESAF_CUSTOMER_TYPE ?? 'I';

    const dto = await this.ds.findCustomer({
      request: {
        profileId,
        clientRequestId: `${Date.now()}`,
        name: '',
        phone1: mobile,
        sourceSystem,
        customerType,
      },
    });

    return mapEsafCustomerToDomain(dto);
  }
}
