'use client';

import { useEffect, useState } from 'react';
import { useCreatePaymentOut, useUpdatePaymentOut } from '../hooks/use-payment-out';
import { AccountCombobox } from '@/features/accounts/components/account-combobox';
import { useGoodsIn } from '@/features/goods-in/hooks/use-goods-in';
import { usePaymentOut } from '../hooks/use-payment-out';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { PaymentOutWithRelations } from '../types';
import { calculateGoodsInBalance } from '../utils/balance';

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
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');

  const { data: goodsInReceipts } = useGoodsIn();
  const { data: allPaymentsOut } = usePaymentOut();
  const createPaymentOut = useCreatePaymentOut();
  const updatePaymentOut = useUpdatePaymentOut();

  useEffect(() => {
    if (payment) {
      setGoodsInReceiptId(payment.goods_in_receipt_id);
      setAccountId(payment.account_id);
      setAmount(payment.amount.toString());
      setDate(payment.date);
      setPaymentMode(payment.payment_mode || 'Cash');
      setNotes(payment.notes || '');
    } else {
      setGoodsInReceiptId('');
      setAccountId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('Cash');
      setNotes('');
    }
  }, [payment, open]);

  // Clear receipt selection when account changes
  useEffect(() => {
    if (accountId && goodsInReceiptId) {
      const receipt = goodsInReceipts?.find((r) => r.id === goodsInReceiptId);
      if (receipt && receipt.account_id !== accountId) {
        setGoodsInReceiptId('');
      }
    }
  }, [accountId, goodsInReceiptId, goodsInReceipts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodsInReceiptId || !accountId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate that the receipt belongs to the selected account
    const receipt = goodsInReceipts?.find((r) => r.id === goodsInReceiptId);
    if (receipt && receipt.account_id !== accountId) {
      toast.error('Selected receipt does not belong to the selected account');
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
          payment_mode: paymentMode,
          notes: notes || undefined,
        });
        toast.success('Payment Out updated successfully');
      } else {
        await createPaymentOut.mutateAsync({
          goods_in_receipt_id: goodsInReceiptId,
          account_id: accountId,
          amount: parseFloat(amount),
          date,
          payment_mode: paymentMode,
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

  // Filter goods in receipts by selected account
  const filteredGoodsInReceipts = goodsInReceipts?.filter(
    (receipt) => !accountId || receipt.account_id === accountId
  ) || [];

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
            <AccountCombobox
              value={accountId}
              onValueChange={(newAccountId) => {
                setAccountId(newAccountId);
                // Clear receipt selection when account changes
                if (newAccountId !== accountId) {
                  setGoodsInReceiptId('');
                }
              }}
              disabled={isPending}
              label="Account"
              required
              placeholder="Search accounts..."
            />
            <div className="space-y-2">
              <Label htmlFor="goods_in_receipt">Goods In Receipt *</Label>
              <Select 
                value={goodsInReceiptId} 
                onValueChange={setGoodsInReceiptId} 
                disabled={isPending || !accountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={accountId ? "Select goods in receipt" : "Select an account first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredGoodsInReceipts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      {accountId ? 'No goods in receipts found for this account' : 'Select an account first'}
                    </div>
                  ) : (
                    filteredGoodsInReceipts.map((receipt) => {
                      const balance = allPaymentsOut
                        ? calculateGoodsInBalance(receipt, allPaymentsOut)
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
              {goodsInReceiptId && allPaymentsOut && goodsInReceipts && (
                <div className="text-sm space-y-1">
                  {(() => {
                    const receipt = goodsInReceipts.find((r) => r.id === goodsInReceiptId);
                    if (!receipt) return null;
                    const balance = calculateGoodsInBalance(receipt, allPaymentsOut);
                    return (
                      <div className="flex flex-col gap-1 p-2 bg-muted rounded-md">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-medium">₹{balance.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paid:</span>
                          <span className="font-medium">₹{balance.paid.toFixed(2)}</span>
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
              <Label htmlFor="payment_mode">Payment Mode *</Label>
              <Select
                value={paymentMode}
                onValueChange={setPaymentMode}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
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
