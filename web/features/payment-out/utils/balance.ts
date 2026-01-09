import type { GoodsInReceiptWithItems } from '@/features/goods-in/types';
import type { PaymentOutWithRelations } from '../types';

export function calculateGoodsInBalance(
  receipt: GoodsInReceiptWithItems,
  paymentsOut: PaymentOutWithRelations[]
): { total: number; paid: number; remaining: number } {
  const total = receipt.total_amount;
  const paid = paymentsOut
    .filter((p) => p.goods_in_receipt_id === receipt.id)
    .reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - paid;

  return { total, paid, remaining };
}
