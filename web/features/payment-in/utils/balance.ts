import type { GoodsOutReceiptWithItems } from '@/features/goods-out/types';
import type { PaymentInWithRelations } from '../types';

export function calculateGoodsOutBalance(
  receipt: GoodsOutReceiptWithItems,
  paymentsIn: PaymentInWithRelations[]
): { total: number; received: number; remaining: number } {
  const total = receipt.total_amount;
  const received = paymentsIn
    .filter((p) => p.goods_out_receipt_id === receipt.id)
    .reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - received;

  return { total, received, remaining };
}
