export type ExistingCustomer = {
  name: string;
  cif: string;
  mobile: string;
  initials: string;
  accounts: { title: string; masked: string; status: string; icon: string }[];
  leads: { title: string; subtitle: string; status: string; icon: string }[];
  insights: { text: string; icon: string }[];
};

