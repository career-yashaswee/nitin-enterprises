'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePaymentOut, useUpdatePaymentOut, usePaymentOutRecord, usePaymentOut } from '../hooks/use-payment-out';
import { AccountCombobox } from '@/features/accounts/components/account-combobox';
import { useGoodsIn } from '@/features/goods-in/hooks/use-goods-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Field, FieldError } from '@/components/ui/field';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { calculateGoodsInBalance } from '../utils/balance';
import { createPaymentOutSchema } from '../schemas/payment-out.schema';
import { useKeyboardShortcut } from '@/features/utilities/keyboard-shortcuts/hooks/use-keyboard-shortcut';
import { getModifierKey } from '@/features/utilities/keyboard-shortcuts/hooks/use-platform';
import { Kbd } from '@/components/ui/kbd';

interface PaymentOutFormPageProps {
  paymentId?: string;
}

export function PaymentOutFormPage({ paymentId }: PaymentOutFormPageProps) {
  const router = useRouter();
  const { data: goodsInReceipts } = useGoodsIn();
  const { data: allPaymentsOut } = usePaymentOut();
  const { data: payment, isLoading: isLoadingPayment } = usePaymentOutRecord(paymentId || '');
  const createPaymentOut = useCreatePaymentOut();
  const updatePaymentOut = useUpdatePaymentOut();
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!paymentId;

  const getRemainingAmount = (receiptId: string): number | null => {
    if (!receiptId || !goodsInReceipts || !allPaymentsOut) return null;
    const receipt = goodsInReceipts.find((r) => r.id === receiptId);
    if (!receipt) return null;
    const balance = calculateGoodsInBalance(receipt, allPaymentsOut);
    if (isEditMode && payment && payment.goods_in_receipt_id === receiptId) {
      return balance.remaining + payment.amount;
    }
    return balance.remaining;
  };

  const schema = createPaymentOutSchema(getRemainingAmount);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      goods_in_receipt_id: '',
      account_id: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      payment_mode: 'Cash',
      notes: '',
    },
  });

  const accountId = watch('account_id');
  const goodsInReceiptId = watch('goods_in_receipt_id');

  useEffect(() => {
    if (payment) {
      reset({
        goods_in_receipt_id: payment.goods_in_receipt_id,
        account_id: payment.account_id,
        amount: payment.amount,
        date: payment.date,
        payment_mode: payment.payment_mode || 'Cash',
        notes: payment.notes || '',
      });
    } else if (!isEditMode) {
      reset({
        goods_in_receipt_id: '',
        account_id: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
        notes: '',
      });
    }
  }, [payment, isEditMode, reset]);

  useEffect(() => {
    // Focus first input after form loads
    if (firstInputRef.current) {
      const input = firstInputRef.current.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (accountId && goodsInReceiptId) {
      const receipt = goodsInReceipts?.find((r) => r.id === goodsInReceiptId);
      if (receipt && receipt.account_id !== accountId) {
        reset({ ...watch(), goods_in_receipt_id: '' });
      }
    }
  }, [accountId, goodsInReceipts, reset, watch, goodsInReceiptId]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && paymentId) {
        await updatePaymentOut.mutateAsync({
          id: paymentId,
          ...data,
          notes: data.notes || undefined,
        });
        toast.success('Payment Out updated successfully');
      } else {
        await createPaymentOut.mutateAsync({
          ...data,
          notes: data.notes || undefined,
        });
        toast.success('Payment Out created successfully');
      }
      router.push('/payment-out');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment');
    }
  };

  const handleCancel = () => {
    router.push('/payment-out');
  };

  useKeyboardShortcut('escape', handleCancel);
  useKeyboardShortcut('mod+enter', () => {
    if (formRef.current) {
      const submitButton = formRef.current.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
  });

  const isPending = createPaymentOut.isPending || updatePaymentOut.isPending || isSubmitting || isLoadingPayment;

  const filteredGoodsInReceipts = goodsInReceipts?.filter(
    (receipt) => !accountId || receipt.account_id === accountId
  ) || [];

  const selectedReceipt = goodsInReceipts?.find((r) => r.id === goodsInReceiptId);
  const balance = selectedReceipt && allPaymentsOut
    ? calculateGoodsInBalance(selectedReceipt, allPaymentsOut)
    : null;
  const remainingAmount = getRemainingAmount(goodsInReceiptId);

  if (isEditMode && isLoadingPayment) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              aria-label="Go back"
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditMode ? 'Edit Payment Out' : 'Create Payment Out'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update payment out information' : 'Record payment made to an account for goods in'}
              </p>
            </div>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <Field>
              <Controller
                name="account_id"
                control={control}
                render={({ field }) => (
                  <div ref={firstInputRef}>
                    <AccountCombobox
                      value={field.value}
                      onValueChange={(newAccountId) => {
                        field.onChange(newAccountId);
                        if (newAccountId !== accountId) {
                          reset({ ...watch(), goods_in_receipt_id: '' });
                        }
                      }}
                      disabled={isPending}
                      label="Account"
                      required
                      placeholder="Search accounts..."
                    />
                  </div>
                )}
              />
              <FieldError errors={[errors.account_id]} />
            </Field>

            <Field>
              <Label htmlFor="goods_in_receipt">Goods In Receipt *</Label>
              <Controller
                name="goods_in_receipt_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
                          const receiptBalance = allPaymentsOut
                            ? calculateGoodsInBalance(receipt, allPaymentsOut)
                            : null;
                          return (
                            <SelectItem key={receipt.id} value={receipt.id}>
                              {new Date(receipt.date).toLocaleDateString()} - ₹{receipt.total_amount.toFixed(2)}
                              {receiptBalance && receiptBalance.remaining > 0 && ` (Remaining: ₹${receiptBalance.remaining.toFixed(2)})`}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.goods_in_receipt_id]} />
              {goodsInReceiptId && balance && (
                <div className="text-sm space-y-1 mt-2">
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
                      <Badge variant={remainingAmount && remainingAmount > 0 ? 'outline' : 'secondary'}>
                        ₹{remainingAmount?.toFixed(2) || '0.00'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isPending}
                />
                <FieldError errors={[errors.amount]} />
              </Field>
              <Field>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                  disabled={isPending}
                />
                <FieldError errors={[errors.date]} />
              </Field>
            </div>

            <Field>
              <Label htmlFor="payment_mode">Payment Mode *</Label>
              <Controller
                name="payment_mode"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
                )}
              />
              <FieldError errors={[errors.payment_mode]} />
            </Field>

            <Field>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                disabled={isPending}
                rows={2}
              />
              <FieldError errors={[errors.notes]} />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel <Kbd>Esc</Kbd>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditMode ? 'Update' : 'Create'} <Kbd>{getModifierKey()}</Kbd>+<Kbd>Enter</Kbd>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
