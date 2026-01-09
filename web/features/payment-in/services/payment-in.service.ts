import { supabase } from '@/lib/supabase/client';
import type { PaymentInWithRelations, CreatePaymentInInput, UpdatePaymentInInput } from '../types';

export const paymentInService = {
  async getAll(): Promise<PaymentInWithRelations[]> {
    const { data, error } = await supabase
      .from('payment_in')
      .select(`
        *,
        goods_out_receipt:goods_out_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PaymentInWithRelations | null> {
    const { data, error } = await supabase
      .from('payment_in')
      .select(`
        *,
        goods_out_receipt:goods_out_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreatePaymentInInput): Promise<PaymentInWithRelations> {
    const { data: receipt } = await supabase
      .from('goods_out_receipts')
      .select('id')
      .eq('id', input.goods_out_receipt_id)
      .single();

    if (!receipt) {
      throw new Error('Goods Out Receipt does not exist');
    }

    const { data, error } = await supabase
      .from('payment_in')
      .insert(input)
      .select(`
        *,
        goods_out_receipt:goods_out_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdatePaymentInInput): Promise<PaymentInWithRelations> {
    const { id, ...updateData } = input;

    if (input.goods_out_receipt_id) {
      const { data: receipt } = await supabase
        .from('goods_out_receipts')
        .select('id')
        .eq('id', input.goods_out_receipt_id)
        .single();

      if (!receipt) {
        throw new Error('Goods Out Receipt does not exist');
      }
    }

    const { data, error } = await supabase
      .from('payment_in')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        goods_out_receipt:goods_out_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('payment_in').delete().eq('id', id);
    if (error) throw error;
  },
};
