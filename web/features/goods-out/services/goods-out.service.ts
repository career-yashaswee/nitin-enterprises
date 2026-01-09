import { supabase } from '@/lib/supabase/client';
import type {
  GoodsOutReceiptWithItems,
  CreateGoodsOutReceiptInput,
  UpdateGoodsOutReceiptInput,
} from '../types';

export const goodsOutService = {
  async getAll(): Promise<GoodsOutReceiptWithItems[]> {
    const { data: receipts, error } = await supabase
      .from('goods_out_receipts')
      .select(`
        *,
        account:accounts(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const receiptsWithItems = await Promise.all(
      (receipts || []).map(async (receipt) => {
        const { data: items } = await supabase
          .from('goods_out_items')
          .select('*')
          .eq('receipt_id', receipt.id)
          .order('created_at');

        return {
          ...receipt,
          items: items || [],
        };
      })
    );

    return receiptsWithItems;
  },

  async getById(id: string): Promise<GoodsOutReceiptWithItems | null> {
    const { data: receipt, error } = await supabase
      .from('goods_out_receipts')
      .select(`
        *,
        account:accounts(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!receipt) return null;

    const { data: items } = await supabase
      .from('goods_out_items')
      .select('*')
      .eq('receipt_id', id)
      .order('created_at');

    return {
      ...receipt,
      items: items || [],
    };
  },

  async create(input: CreateGoodsOutReceiptInput): Promise<GoodsOutReceiptWithItems> {
    // Validate inventory first
    for (const item of input.items) {
      const { data: inventory } = await supabase
        .from('inventory')
        .select('available_quantity')
        .eq('item_name', item.item_name)
        .single();

      if (!inventory || inventory.available_quantity < item.quantity) {
        throw new Error(
          `Insufficient inventory for ${item.item_name}. Available: ${inventory?.available_quantity || 0}, Required: ${item.quantity}`
        );
      }
    }

    const { data: receipt, error: receiptError } = await supabase
      .from('goods_out_receipts')
      .insert({
        account_id: input.account_id,
        date: input.date,
        notes: input.notes,
      })
      .select()
      .single();

    if (receiptError) throw receiptError;
    if (!receipt) throw new Error('Failed to create receipt');

    if (input.items.length > 0) {
      const itemsToInsert = input.items.map((item) => ({
        receipt_id: receipt.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('goods_out_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    return this.getById(receipt.id) as Promise<GoodsOutReceiptWithItems>;
  },

  async update(input: UpdateGoodsOutReceiptInput): Promise<GoodsOutReceiptWithItems> {
    const { id, items, ...updateData } = input;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('goods_out_receipts')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    }

    if (items !== undefined) {
      await supabase.from('goods_out_items').delete().eq('receipt_id', id);

      if (items.length > 0) {
        // Validate inventory
        for (const item of items) {
          const { data: inventory } = await supabase
            .from('inventory')
            .select('available_quantity')
            .eq('item_name', item.item_name)
            .single();

          if (!inventory || inventory.available_quantity < item.quantity) {
            throw new Error(
              `Insufficient inventory for ${item.item_name}. Available: ${inventory?.available_quantity || 0}, Required: ${item.quantity}`
            );
          }
        }

        const itemsToInsert = items.map((item) => ({
          receipt_id: id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        }));

        const { error } = await supabase.from('goods_out_items').insert(itemsToInsert);
        if (error) throw error;
      }
    }

    return this.getById(id) as Promise<GoodsOutReceiptWithItems>;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('goods_out_receipts').delete().eq('id', id);
    if (error) throw error;
  },
};
