import type { ExistingCustomer } from '@/domain/customers/customer';
import type { CustomerRepository } from '@/domain/customers/customer-repository';

export class FindCustomerByMobile {
  constructor(private readonly repo: CustomerRepository) {}

  execute(mobile: string): Promise<ExistingCustomer | null> {
    return this.repo.findCustomerByMobile(mobile);
  }
}

