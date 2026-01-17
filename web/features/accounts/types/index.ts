export interface Account {
  id: string;
  name: string;
  contact_info: string | null;
  address: string | null;
  type: 'creditor' | 'debitor';
  created_at: string;
  updated_at: string;
}

export interface CreateAccountInput {
  name: string;
  contact_info?: string;
  address?: string;
  type?: 'creditor' | 'debitor';
}

export interface UpdateAccountInput extends Partial<CreateAccountInput> {
  id: string;
}
