export interface PaymentIn {
  id: string;
  goods_out_receipt_id: string;
  account_id: string;
  amount: number;
  date: string;
  payment_mode: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentInWithRelations extends PaymentIn {
  goods_out_receipt?: {
    id: string;
    date: string;
    total_amount: number;
  };
  account?: {
    id: string;
    name: string;
  };
}

export interface CreatePaymentInInput {
  goods_out_receipt_id: string;
  account_id: string;
  amount: number;
  date: string;
  payment_mode?: string;
  notes?: string;
}

export interface UpdatePaymentInInput {
  id: string;
  goods_out_receipt_id?: string;
  account_id?: string;
  amount?: number;
  date?: string;
  payment_mode?: string;
  notes?: string;
}
