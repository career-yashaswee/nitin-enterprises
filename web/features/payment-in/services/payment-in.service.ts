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
    // Validate goods_out_receipt exists and get total amount
    const { data: receipt } = await supabase
      .from('goods_out_receipts')
      .select('id, total_amount')
      .eq('id', input.goods_out_receipt_id)
      .single();

    if (!receipt) {
      throw new Error('Goods Out Receipt does not exist');
    }

    // Calculate remaining amount
    const { data: existingPayments } = await supabase
      .from('payment_in')
      .select('amount')
      .eq('goods_out_receipt_id', input.goods_out_receipt_id);

    const totalReceived = existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const remaining = receipt.total_amount - totalReceived;

    // Validate amount doesn't exceed remaining
    if (input.amount > remaining) {
      throw new Error(
        `Amount cannot exceed remaining amount. Remaining: ₹${remaining.toFixed(2)}, Attempted: ₹${input.amount.toFixed(2)}`
      );
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

    // Get current payment to calculate remaining correctly
    const { data: currentPayment } = await supabase
      .from('payment_in')
      .select('goods_out_receipt_id, amount')
      .eq('id', id)
      .single();

    const receiptId = input.goods_out_receipt_id || currentPayment?.goods_out_receipt_id;
    if (!receiptId) {
      throw new Error('Goods Out Receipt ID is required');
    }

    // Validate goods_out_receipt exists and get total amount
    const { data: receipt } = await supabase
      .from('goods_out_receipts')
      .select('id, total_amount')
      .eq('id', receiptId)
      .single();

    if (!receipt) {
      throw new Error('Goods Out Receipt does not exist');
    }

    // Calculate remaining amount (excluding current payment)
    const { data: existingPayments } = await supabase
      .from('payment_in')
      .select('amount')
      .eq('goods_out_receipt_id', receiptId);

    const currentPaymentAmount = currentPayment?.amount || 0;
    const totalReceived = (existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0) - currentPaymentAmount;
    const remaining = receipt.total_amount - totalReceived;

    // Validate amount doesn't exceed remaining (if amount is being updated)
    if (input.amount !== undefined && input.amount > remaining) {
      throw new Error(
        `Amount cannot exceed remaining amount. Remaining: ₹${remaining.toFixed(2)}, Attempted: ₹${input.amount.toFixed(2)}`
      );
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

  async getByGoodsOutReceiptId(goodsOutReceiptId: string): Promise<PaymentInWithRelations[]> {
    const { data, error } = await supabase
      .from('payment_in')
      .select(`
        *,
        goods_out_receipt:goods_out_receipts(id, date, total_amount),
        account:accounts(id, name)
      `)
      .eq('goods_out_receipt_id', goodsOutReceiptId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
