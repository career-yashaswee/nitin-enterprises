export interface PaymentOut {
  id: string;
  goods_in_receipt_id: string;
  account_id: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentOutWithRelations extends PaymentOut {
  goods_in_receipt?: {
    id: string;
    date: string;
    total_amount: number;
  };
  account?: {
    id: string;
    name: string;
  };
}

export interface CreatePaymentOutInput {
  goods_in_receipt_id: string;
  account_id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface UpdatePaymentOutInput {
  id: string;
  goods_in_receipt_id?: string;
  account_id?: string;
  amount?: number;
  date?: string;
  notes?: string;
}
