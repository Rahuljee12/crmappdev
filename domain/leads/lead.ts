export type LeadStatus = 'Hot' | 'Warm' | 'Cold';

export type Lead = {
  id: string;
  name: string;
  product: string;
  amount: string;
  source: string;
  time: string;
  status: LeadStatus;
};

