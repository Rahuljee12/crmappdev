import type { CustomerSearchResult } from './customer-search-result';

export interface CustomerRepository {
  findCustomerByMobile(mobile: string): Promise<CustomerSearchResult[]>;
}
