import type { CustomerRepository } from '@/domain/customers/customer-repository';
import type { CustomerSearchResult } from '@/domain/customers/customer-search-result';

import { EsafCustomerDatasource } from '@/data/datasource/esaf-customer-datasource';
import { mapEsafCustomerToDomain } from '@/data/mapper/customer.mapper';

export class CustomerApiRepository implements CustomerRepository {
  constructor(private readonly ds: EsafCustomerDatasource) {}

  async findCustomerByMobile(mobile: string): Promise<CustomerSearchResult[]> {
    const profileId = '1';
    const sourceSystem = 'PRIME';
    const customerType = 'I';
    const clientRequestId = `${Math.floor(100000000 + Math.random() * 900000000)}`;

    const dto = await this.ds.findCustomer({
      request: {
        profileId,
        clientRequestId,
        phone1: mobile,
        sourceSystem,
        customerType,
      },
    });

    return mapEsafCustomerToDomain(dto);
  }
}
