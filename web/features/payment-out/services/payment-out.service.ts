import { supabase } from '@/lib/supabase/client';
import type { PaymentOutWithRelations, CreatePaymentOutInput, UpdatePaymentOutInput } from '../types';

export const paymentOutService = {
  async getAll(): Promise<PaymentOutWithRelations[]> {
    const { data, error } = await supabase
      .from('payment_out')
      .select(`
        *,
        goods_in_receipt:goods_in_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PaymentOutWithRelations | null> {
    const { data, error } = await supabase
      .from('payment_out')
      .select(`
        *,
        goods_in_receipt:goods_in_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreatePaymentOutInput): Promise<PaymentOutWithRelations> {
    // Validate goods_in_receipt exists
    const { data: receipt } = await supabase
      .from('goods_in_receipts')
      .select('id')
      .eq('id', input.goods_in_receipt_id)
      .single();

    if (!receipt) {
      throw new Error('Goods In Receipt does not exist');
    }

    const { data, error } = await supabase
      .from('payment_out')
      .insert(input)
      .select(`
        *,
        goods_in_receipt:goods_in_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdatePaymentOutInput): Promise<PaymentOutWithRelations> {
    const { id, ...updateData } = input;

    if (input.goods_in_receipt_id) {
      const { data: receipt } = await supabase
        .from('goods_in_receipts')
        .select('id')
        .eq('id', input.goods_in_receipt_id)
        .single();

      if (!receipt) {
        throw new Error('Goods In Receipt does not exist');
      }
    }

    const { data, error } = await supabase
      .from('payment_out')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        goods_in_receipt:goods_in_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('payment_out').delete().eq('id', id);
    if (error) throw error;
  },
};
