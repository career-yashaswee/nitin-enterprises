'use client';

import { useEffect, useState } from 'react';
import { useCreatePaymentIn, useUpdatePaymentIn } from '../hooks/use-payment-in';
import { useAccounts } from '@/features/accounts/hooks/use-accounts';
import { useGoodsOut } from '@/features/goods-out/hooks/use-goods-out';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { PaymentInWithRelations } from '../types';

interface PaymentInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: PaymentInWithRelations | null;
}

export function PaymentInForm({ open, onOpenChange, payment }: PaymentInFormProps) {
  const [goodsOutReceiptId, setGoodsOutReceiptId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const { data: accounts } = useAccounts();
  const { data: goodsOutReceipts } = useGoodsOut();
  const createPaymentIn = useCreatePaymentIn();
  const updatePaymentIn = useUpdatePaymentIn();

  useEffect(() => {
    if (payment) {
      setGoodsOutReceiptId(payment.goods_out_receipt_id);
      setAccountId(payment.account_id);
      setAmount(payment.amount.toString());
      setDate(payment.date);
      setNotes(payment.notes || '');
    } else {
      setGoodsOutReceiptId('');
      setAccountId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [payment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodsOutReceiptId || !accountId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (payment) {
        await updatePaymentIn.mutateAsync({
          id: payment.id,
          goods_out_receipt_id: goodsOutReceiptId,
          account_id: accountId,
          amount: parseFloat(amount),
          date,
          notes: notes || undefined,
        });
        toast.success('Payment In updated successfully');
      } else {
        await createPaymentIn.mutateAsync({
          goods_out_receipt_id: goodsOutReceiptId,
          account_id: accountId,
          amount: parseFloat(amount),
          date,
          notes: notes || undefined,
        });
        toast.success('Payment In created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment');
    }
  };

  const isPending = createPaymentIn.isPending || updatePaymentIn.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? 'Edit Payment In' : 'Create Payment In'}</DialogTitle>
          <DialogDescription>
            {payment ? 'Update payment in information' : 'Record payment received from an account for goods out'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goods_out_receipt">Goods Out Receipt *</Label>
              <Select value={goodsOutReceiptId} onValueChange={setGoodsOutReceiptId} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goods out receipt" />
                </SelectTrigger>
                <SelectContent>
                  {goodsOutReceipts?.map((receipt) => (
                    <SelectItem key={receipt.id} value={receipt.id}>
                      {receipt.account?.name} - {new Date(receipt.date).toLocaleDateString()} - ₹{receipt.total_amount.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account *</Label>
              <Select value={accountId} onValueChange={setAccountId} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : payment ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
