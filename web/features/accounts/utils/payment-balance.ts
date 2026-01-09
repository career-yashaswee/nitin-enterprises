import type { Account } from '../types';
import type { GoodsInReceiptWithItems } from '@/features/goods-in/types';
import type { GoodsOutReceiptWithItems } from '@/features/goods-out/types';
import type { PaymentInWithRelations } from '@/features/payment-in/types';
import type { PaymentOutWithRelations } from '@/features/payment-out/types';

export interface AccountBalance {
  accountId: string;
  accountName: string;
  totalGoodsIn: number;
  totalGoodsOut: number;
  totalPaymentsOut: number;
  totalPaymentsIn: number;
  balanceToCollect: number; // Goods Out - Payments In (money we should receive)
  balanceToPay: number; // Goods In - Payments Out (money we should pay)
}

export function calculateAccountBalances(
  accounts: Account[],
  goodsIn: GoodsInReceiptWithItems[],
  goodsOut: GoodsOutReceiptWithItems[],
  paymentsIn: PaymentInWithRelations[],
  paymentsOut: PaymentOutWithRelations[]
): AccountBalance[] {
  return accounts.map((account) => {
    const accountGoodsIn = goodsIn.filter((gi) => gi.account_id === account.id);
    const accountGoodsOut = goodsOut.filter((go) => go.account_id === account.id);
    const accountPaymentsIn = paymentsIn.filter((pi) => pi.account_id === account.id);
    const accountPaymentsOut = paymentsOut.filter((po) => po.account_id === account.id);

    const totalGoodsIn = accountGoodsIn.reduce((sum, gi) => sum + gi.total_amount, 0);
    const totalGoodsOut = accountGoodsOut.reduce((sum, go) => sum + go.total_amount, 0);
    const totalPaymentsIn = accountPaymentsIn.reduce((sum, pi) => sum + pi.amount, 0);
    const totalPaymentsOut = accountPaymentsOut.reduce((sum, po) => sum + po.amount, 0);

    // Balance to collect: Money we should receive (Goods Out - Payments In)
    const balanceToCollect = totalGoodsOut - totalPaymentsIn;

    // Balance to pay: Money we should pay (Goods In - Payments Out)
    const balanceToPay = totalGoodsIn - totalPaymentsOut;

    return {
      accountId: account.id,
      accountName: account.name,
      totalGoodsIn,
      totalGoodsOut,
      totalPaymentsIn,
      totalPaymentsOut,
      balanceToCollect,
      balanceToPay,
    };
  });
}
