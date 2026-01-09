'use client';

import { useEffect, useState } from 'react';
import { useCreatePaymentIn, useUpdatePaymentIn } from '../hooks/use-payment-in';
import { AccountCombobox } from '@/features/accounts/components/account-combobox';
import { useGoodsOut } from '@/features/goods-out/hooks/use-goods-out';
import { usePaymentIn } from '../hooks/use-payment-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { PaymentInWithRelations } from '../types';
import { calculateGoodsOutBalance } from '../utils/balance';

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

  const { data: goodsOutReceipts } = useGoodsOut();
  const { data: allPaymentsIn } = usePaymentIn();
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

  // Clear receipt selection when account changes
  useEffect(() => {
    if (accountId && goodsOutReceiptId) {
      const receipt = goodsOutReceipts?.find((r) => r.id === goodsOutReceiptId);
      if (receipt && receipt.account_id !== accountId) {
        setGoodsOutReceiptId('');
      }
    }
  }, [accountId, goodsOutReceiptId, goodsOutReceipts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodsOutReceiptId || !accountId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate that the receipt belongs to the selected account
    const receipt = goodsOutReceipts?.find((r) => r.id === goodsOutReceiptId);
    if (receipt && receipt.account_id !== accountId) {
      toast.error('Selected receipt does not belong to the selected account');
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

  // Filter goods out receipts by selected account
  const filteredGoodsOutReceipts = goodsOutReceipts?.filter(
    (receipt) => !accountId || receipt.account_id === accountId
  ) || [];

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
            <AccountCombobox
              value={accountId}
              onValueChange={(newAccountId) => {
                setAccountId(newAccountId);
                // Clear receipt selection when account changes
                if (newAccountId !== accountId) {
                  setGoodsOutReceiptId('');
                }
              }}
              disabled={isPending}
              label="Account"
              required
              placeholder="Search accounts..."
            />
            <div className="space-y-2">
              <Label htmlFor="goods_out_receipt">Goods Out Receipt *</Label>
              <Select 
                value={goodsOutReceiptId} 
                onValueChange={setGoodsOutReceiptId} 
                disabled={isPending || !accountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={accountId ? "Select goods out receipt" : "Select an account first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredGoodsOutReceipts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      {accountId ? 'No goods out receipts found for this account' : 'Select an account first'}
                    </div>
                  ) : (
                    filteredGoodsOutReceipts.map((receipt) => {
                      const balance = allPaymentsIn
                        ? calculateGoodsOutBalance(receipt, allPaymentsIn)
                        : null;
                      return (
                        <SelectItem key={receipt.id} value={receipt.id}>
                          {new Date(receipt.date).toLocaleDateString()} - ₹{receipt.total_amount.toFixed(2)}
                          {balance && balance.remaining > 0 && ` (Remaining: ₹${balance.remaining.toFixed(2)})`}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              {goodsOutReceiptId && allPaymentsIn && goodsOutReceipts && (
                <div className="text-sm space-y-1">
                  {(() => {
                    const receipt = goodsOutReceipts.find((r) => r.id === goodsOutReceiptId);
                    if (!receipt) return null;
                    const balance = calculateGoodsOutBalance(receipt, allPaymentsIn);
                    return (
                      <div className="flex flex-col gap-1 p-2 bg-muted rounded-md">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-medium">₹{balance.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Received:</span>
                          <span className="font-medium">₹{balance.received.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="font-medium">Remaining:</span>
                          <Badge variant={balance.remaining > 0 ? 'outline' : 'secondary'}>
                            ₹{balance.remaining.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
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
