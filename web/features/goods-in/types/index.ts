export interface GoodsInReceipt {
  id: string;
  account_id: string;
  date: string;
  notes: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface GoodsInItem {
  id: string;
  receipt_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface GoodsInReceiptWithItems extends GoodsInReceipt {
  items: GoodsInItem[];
  account?: {
    id: string;
    name: string;
  };
}

export interface CreateGoodsInReceiptInput {
  account_id: string;
  date: string;
  notes?: string;
  items: Omit<GoodsInItem, 'id' | 'receipt_id' | 'created_at'>[];
}

export interface UpdateGoodsInReceiptInput {
  id: string;
  account_id?: string;
  date?: string;
  notes?: string;
  items?: Omit<GoodsInItem, 'id' | 'receipt_id' | 'created_at'>[];
}
