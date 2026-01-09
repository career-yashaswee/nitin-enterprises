'use client';

import { useEffect, useState } from 'react';
import { useCreatePaymentOut, useUpdatePaymentOut } from '../hooks/use-payment-out';
import { useAccounts } from '@/features/accounts/hooks/use-accounts';
import { useGoodsIn } from '@/features/goods-in/hooks/use-goods-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { PaymentOutWithRelations } from '../types';

interface PaymentOutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: PaymentOutWithRelations | null;
}

export function PaymentOutForm({ open, onOpenChange, payment }: PaymentOutFormProps) {
  const [goodsInReceiptId, setGoodsInReceiptId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const { data: accounts } = useAccounts();
  const { data: goodsInReceipts } = useGoodsIn();
  const createPaymentOut = useCreatePaymentOut();
  const updatePaymentOut = useUpdatePaymentOut();

  useEffect(() => {
    if (payment) {
      setGoodsInReceiptId(payment.goods_in_receipt_id);
      setAccountId(payment.account_id);
      setAmount(payment.amount.toString());
      setDate(payment.date);
      setNotes(payment.notes || '');
    } else {
      setGoodsInReceiptId('');
      setAccountId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [payment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodsInReceiptId || !accountId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (payment) {
        await updatePaymentOut.mutateAsync({
          id: payment.id,
          goods_in_receipt_id: goodsInReceiptId,
          account_id: accountId,
          amount: parseFloat(amount),
          date,
          notes: notes || undefined,
        });
        toast.success('Payment Out updated successfully');
      } else {
        await createPaymentOut.mutateAsync({
          goods_in_receipt_id: goodsInReceiptId,
          account_id: accountId,
          amount: parseFloat(amount),
          date,
          notes: notes || undefined,
        });
        toast.success('Payment Out created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment');
    }
  };

  const isPending = createPaymentOut.isPending || updatePaymentOut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? 'Edit Payment Out' : 'Create Payment Out'}</DialogTitle>
          <DialogDescription>
            {payment ? 'Update payment out information' : 'Record payment made to an account for goods in'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goods_in_receipt">Goods In Receipt *</Label>
              <Select value={goodsInReceiptId} onValueChange={setGoodsInReceiptId} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goods in receipt" />
                </SelectTrigger>
                <SelectContent>
                  {goodsInReceipts?.map((receipt) => (
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
