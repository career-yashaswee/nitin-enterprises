'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePaymentIn, useUpdatePaymentIn, usePaymentInRecord, usePaymentIn } from '../hooks/use-payment-in';
import { AccountCombobox } from '@/features/accounts/components/account-combobox';
import { useGoodsOut } from '@/features/goods-out/hooks/use-goods-out';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Field, FieldError } from '@/components/ui/field';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { calculateGoodsOutBalance } from '../utils/balance';
import { createPaymentInSchema } from '../schemas/payment-in.schema';
import { useKeyboardShortcut } from '@/features/utilities/keyboard-shortcuts/hooks/use-keyboard-shortcut';
import { getModifierKey } from '@/features/utilities/keyboard-shortcuts/hooks/use-platform';
import { Kbd } from '@/components/ui/kbd';

interface PaymentInFormPageProps {
  paymentId?: string;
}

export function PaymentInFormPage({ paymentId }: PaymentInFormPageProps) {
  const router = useRouter();
  const { data: goodsOutReceipts } = useGoodsOut();
  const { data: allPaymentsIn } = usePaymentIn();
  const { data: payment, isLoading: isLoadingPayment } = usePaymentInRecord(paymentId || '');
  const createPaymentIn = useCreatePaymentIn();
  const updatePaymentIn = useUpdatePaymentIn();
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!paymentId;

  const getRemainingAmount = (receiptId: string): number | null => {
    if (!receiptId || !goodsOutReceipts || !allPaymentsIn) return null;
    const receipt = goodsOutReceipts.find((r) => r.id === receiptId);
    if (!receipt) return null;
    const balance = calculateGoodsOutBalance(receipt, allPaymentsIn);
    if (isEditMode && payment && payment.goods_out_receipt_id === receiptId) {
      return balance.remaining + payment.amount;
    }
    return balance.remaining;
  };

  const schema = createPaymentInSchema(getRemainingAmount);

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
      goods_out_receipt_id: '',
      account_id: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      payment_mode: 'Cash',
      notes: '',
    },
  });

  const accountId = watch('account_id');
  const goodsOutReceiptId = watch('goods_out_receipt_id');

  useEffect(() => {
    if (payment) {
      reset({
        goods_out_receipt_id: payment.goods_out_receipt_id,
        account_id: payment.account_id,
        amount: payment.amount,
        date: payment.date,
        payment_mode: payment.payment_mode || 'Cash',
        notes: payment.notes || '',
      });
    } else if (!isEditMode) {
      reset({
        goods_out_receipt_id: '',
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
    if (accountId && goodsOutReceiptId) {
      const receipt = goodsOutReceipts?.find((r) => r.id === goodsOutReceiptId);
      if (receipt && receipt.account_id !== accountId) {
        reset({ ...watch(), goods_out_receipt_id: '' });
      }
    }
  }, [accountId, goodsOutReceipts, reset, watch, goodsOutReceiptId]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && paymentId) {
        await updatePaymentIn.mutateAsync({
          id: paymentId,
          ...data,
          notes: data.notes || undefined,
        });
        toast.success('Payment In updated successfully');
      } else {
        await createPaymentIn.mutateAsync({
          ...data,
          notes: data.notes || undefined,
        });
        toast.success('Payment In created successfully');
      }
      router.push('/payment-in');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment');
    }
  };

  const handleCancel = () => {
    router.push('/payment-in');
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

  const isPending = createPaymentIn.isPending || updatePaymentIn.isPending || isSubmitting || isLoadingPayment;

  const filteredGoodsOutReceipts = goodsOutReceipts?.filter(
    (receipt) => !accountId || receipt.account_id === accountId
  ) || [];

  const selectedReceipt = goodsOutReceipts?.find((r) => r.id === goodsOutReceiptId);
  const balance = selectedReceipt && allPaymentsIn
    ? calculateGoodsOutBalance(selectedReceipt, allPaymentsIn)
    : null;
  const remainingAmount = getRemainingAmount(goodsOutReceiptId);

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
                {isEditMode ? 'Edit Payment In' : 'Create Payment In'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update payment in information' : 'Record payment received from an account for goods out'}
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
                          reset({ ...watch(), goods_out_receipt_id: '' });
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
              <Label htmlFor="goods_out_receipt">Goods Out Receipt *</Label>
              <Controller
                name="goods_out_receipt_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
                          const receiptBalance = allPaymentsIn
                            ? calculateGoodsOutBalance(receipt, allPaymentsIn)
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
              <FieldError errors={[errors.goods_out_receipt_id]} />
              {goodsOutReceiptId && balance && (
                <div className="text-sm space-y-1 mt-2">
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
