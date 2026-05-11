import type { ExistingCustomer } from './customer';

export interface CustomerRepository {
  findCustomerByMobile(mobile: string): Promise<ExistingCustomer | null>;
}

