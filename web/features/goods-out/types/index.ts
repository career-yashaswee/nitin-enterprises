export interface GoodsOutReceipt {
  id: string;
  account_id: string;
  date: string;
  notes: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface GoodsOutItem {
  id: string;
  receipt_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface GoodsOutReceiptWithItems extends GoodsOutReceipt {
  items: GoodsOutItem[];
  account?: {
    id: string;
    name: string;
  };
}

export interface CreateGoodsOutReceiptInput {
  account_id: string;
  date: string;
  notes?: string;
  items: Omit<GoodsOutItem, 'id' | 'receipt_id' | 'created_at'>[];
}

export interface UpdateGoodsOutReceiptInput {
  id: string;
  account_id?: string;
  date?: string;
  notes?: string;
  items?: Omit<GoodsOutItem, 'id' | 'receipt_id' | 'created_at'>[];
}
