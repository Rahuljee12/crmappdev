import { CreateLead } from '@/application/leads/create-lead';
import { ListLeads } from '@/application/leads/list-leads';
import { LeadApiRepository } from '@/adapters/leads/lead-api-repository';
import { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';

import { FindCustomerByMobile } from '@/application/customers/find-customer';
import { CustomerApiRepository } from '@/adapters/customers/customer-api-repository';
import { EsafCustomerDatasource } from '@/data/datasource/esaf-customer-datasource';

const leadRepo = new LeadApiRepository(new EsafLeadsDatasource());

const customerRepo = new CustomerApiRepository(new EsafCustomerDatasource());

export const leadUseCases = {
  listLeads: new ListLeads(leadRepo),
  createLead: new CreateLead(leadRepo),
};

export const customerUseCases = {
  findCustomerByMobile: new FindCustomerByMobile(customerRepo),
};

export function createLead(params: import('@/domain/leads/create-lead-params').CreateLeadParams) {
  return leadUseCases.createLead.execute(params);
}
