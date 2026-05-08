export type SRStatus = 'Open' | 'In Progress' | 'Completed' | 'Rejected';

export type SRItem = {
  id: string;
  srNo: string;
  customer: string;
  phone: string;
  type: string;
  date: string;
  status: SRStatus;
};

