import type { EsafLeadsDatasource } from '@/data/datasource/esaf-leads-datasource';

export type ValidatePanParams = {
  pan: string;
  name: string;
  fathername: string;
  dob: string; // YYYY-MM-DD
};

export class ValidatePan {
  constructor(private readonly ds: EsafLeadsDatasource) {}

  execute(params: ValidatePanParams) {
    return this.ds.validatePan(params);
  }
}

