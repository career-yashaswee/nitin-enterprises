export interface Account {
  id: string;
  name: string;
  contact_info: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountInput {
  name: string;
  contact_info?: string;
  address?: string;
}

export interface UpdateAccountInput extends Partial<CreateAccountInput> {
  id: string;
}
