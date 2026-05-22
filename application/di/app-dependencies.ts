import { CreateLead } from '@/application/leads/create-lead';
import { ListLeads } from '@/application/leads/list-leads';
import { LeadApiRepository } from '@/adapters/leads/lead-api-repository';
import { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';

import { FindCustomerByMobile } from '@/application/customers/find-customer';
import { CustomerApiRepository } from '@/adapters/customers/customer-api-repository';
import { EsafCustomerDatasource } from '@/data/datasource/esaf-customer-datasource';
import { SendLeadCreationOtp } from '@/application/leads/send-lead-otp';
import { VerifyLeadCreationOtp } from '@/application/leads/verify-lead-otp';
import { GenerateAadhaarOtp } from '@/application/leads/generate-aadhaar-otp';
import { AuthenticateAadhaarOtp } from '@/application/leads/authenticate-aadhaar-otp';
import { FetchAadhaarDetails } from '@/application/leads/fetch-aadhaar-details';
import { ValidatePan } from '@/application/leads/validate-pan';
import { CreateServiceRequest } from '@/application/sr/create-sr';
import { EsafSrDatasource } from '@/data/datasource/esaf-sr-datasource';
import { SrApiRepository } from '@/adapters/sr/sr-api-repository';

const esafLeadsDs = new EsafLeadsDatasource();
const leadRepo = new LeadApiRepository(esafLeadsDs);

const customerRepo = new CustomerApiRepository(new EsafCustomerDatasource());
const srRepo = new SrApiRepository(new EsafSrDatasource());

export const leadUseCases = {
  listLeads: new ListLeads(leadRepo),
  createLead: new CreateLead(leadRepo),

  sendLeadCreationOtp: new SendLeadCreationOtp(esafLeadsDs),
  verifyLeadCreationOtp: new VerifyLeadCreationOtp(esafLeadsDs),

  generateAadhaarOtp: new GenerateAadhaarOtp(esafLeadsDs),
  authenticateAadhaarOtp: new AuthenticateAadhaarOtp(esafLeadsDs),
  fetchAadhaarDetails: new FetchAadhaarDetails(esafLeadsDs),
  validatePan: new ValidatePan(esafLeadsDs),
};

export const customerUseCases = {
  findCustomerByMobile: new FindCustomerByMobile(customerRepo),
};

export const srUseCases = {
  createServiceRequest: new CreateServiceRequest(srRepo),
};

export function createLead(params: import('@/domain/leads/create-lead-params').CreateLeadParams) {
  return leadUseCases.createLead.execute(params);
}

export function createServiceRequest(params: import('@/domain/sr/create-sr-params').CreateSrParams) {
  return srUseCases.createServiceRequest.execute(params);
}
