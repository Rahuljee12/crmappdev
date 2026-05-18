import type { CustomerSearchResult } from '@/domain/customers/customer-search-result';
import type { CustomerRepository } from '@/domain/customers/customer-repository';

export class FindCustomerByMobile {
  constructor(private readonly repo: CustomerRepository) {}

  execute(mobile: string): Promise<CustomerSearchResult[]> {
    return this.repo.findCustomerByMobile(mobile);
  }
}
