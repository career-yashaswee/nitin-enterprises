'use client';

import { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateGoodsOut, useUpdateGoodsOut } from '../hooks/use-goods-out';
import { AccountCombobox } from '@/features/accounts/components/account-combobox';
import { useInventory } from '@/features/inventory/hooks/use-inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldError } from '@/components/ui/field';
import { toast } from 'sonner';
import type { GoodsOutReceiptWithItems } from '../types';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { createGoodsOutSchema } from '../schemas/goods-out.schema';

interface GoodsOutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: GoodsOutReceiptWithItems | null;
}

export function GoodsOutForm({ open, onOpenChange, receipt }: GoodsOutFormProps) {
  const { data: inventory } = useInventory();
  const createGoodsOut = useCreateGoodsOut();
  const updateGoodsOut = useUpdateGoodsOut();

  const getAvailableQuantity = (itemName: string): number | null => {
    if (!itemName || !inventory) return null;
    const item = inventory.find((inv) => inv.item_name === itemName);
    return item?.available_quantity ?? null;
  };

  const schema = createGoodsOutSchema(getAvailableQuantity);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      account_id: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      items: [] as Array<{
        item_name: string;
        quantity: number;
        unit: string;
        unit_price: number;
        total: number;
      }>,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');

  useEffect(() => {
    if (receipt) {
      reset({
        account_id: receipt.account_id,
        date: receipt.date,
        notes: receipt.notes || '',
        items: receipt.items.map((item) => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit || 'Kg',
          unit_price: item.unit_price,
          total: item.total,
        })),
      });
    } else {
      reset({
        account_id: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [],
      });
    }
  }, [receipt, open, reset]);

  const addItem = () => {
    append({ item_name: '', quantity: 0, unit: 'Kg', unit_price: 0, total: 0 });
  };

  const updateItemTotal = (index: number) => {
    const item = items[index];
    if (item) {
      const total = item.quantity * item.unit_price;
      setValue(`items.${index}.total`, total);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (receipt) {
        await updateGoodsOut.mutateAsync({
          id: receipt.id,
          account_id: data.account_id,
          date: data.date,
          notes: data.notes || undefined,
          items: data.items,
        });
        toast.success('Goods Out receipt updated successfully');
      } else {
        await createGoodsOut.mutateAsync({
          account_id: data.account_id,
          date: data.date,
          notes: data.notes || undefined,
          items: data.items,
        });
        toast.success('Goods Out receipt created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save receipt');
    }
  };

  const isPending = createGoodsOut.isPending || updateGoodsOut.isPending || isSubmitting;
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{receipt ? 'Edit Goods Out Receipt' : 'Create Goods Out Receipt'}</DialogTitle>
          <DialogDescription>
            {receipt ? 'Update goods out receipt information' : 'Record goods sold to an account'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              <Field>
                <Controller
                  name="account_id"
                  control={control}
                  render={({ field }) => (
                    <AccountCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                      label="Account"
                      required
                      placeholder="Search accounts..."
                    />
                  )}
                />
                <FieldError errors={[errors.account_id]} />
              </Field>
              <Field>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                  disabled={isPending}
                  className="h-10"
                />
                <FieldError errors={[errors.date]} />
              </Field>
            </div>
            <Field>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                disabled={isPending}
                rows={4}
                className="min-h-[100px]"
              />
              <FieldError errors={[errors.notes]} />
            </Field>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={isPending}>
                  <PlusIcon className="size-4" />
                  Add Item
                </Button>
              </div>
              {fields.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="py-4">Item Name</TableHead>
                        <TableHead className="py-4">Available</TableHead>
                        <TableHead className="py-4">Quantity</TableHead>
                        <TableHead className="py-4">Unit</TableHead>
                        <TableHead className="py-4">Unit Price</TableHead>
                        <TableHead className="py-4">Total</TableHead>
                        <TableHead className="w-[60px] py-4"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const item = items[index];
                        const available = getAvailableQuantity(item?.item_name || '');
                        const itemErrors = errors.items?.[index];
                        return (
                          <TableRow key={field.id} className="hover:bg-muted/50">
                            <TableCell className="py-4">
                              <Controller
                                name={`items.${index}.item_name`}
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    placeholder="Item name"
                                    disabled={isPending}
                                    className="h-10"
                                  />
                                )}
                              />
                              {itemErrors?.item_name && (
                                <FieldError errors={[itemErrors.item_name]} />
                              )}
                            </TableCell>
                            <TableCell
                              className={`py-4 text-base font-medium ${
                                available !== null && item && item.quantity > available
                                  ? 'text-destructive'
                                  : ''
                              }`}
                            >
                              {available !== null ? available : '-'}
                            </TableCell>
                            <TableCell className="py-4">
                              <Controller
                                name={`items.${index}.quantity`}
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={available !== null ? available : undefined}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value) || 0;
                                      field.onChange(value);
                                      updateItemTotal(index);
                                    }}
                                    disabled={isPending}
                                    className="h-10"
                                  />
                                )}
                              />
                              {itemErrors?.quantity && (
                                <FieldError errors={[itemErrors.quantity]} />
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              <Controller
                                name={`items.${index}.unit`}
                                control={control}
                                render={({ field }) => (
                                  <Select value={field.value || 'Kg'} onValueChange={field.onChange} disabled={isPending}>
                                    <SelectTrigger className="h-10">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Kg">Kg</SelectItem>
                                      <SelectItem value="Bucket">Bucket</SelectItem>
                                      <SelectItem value="Packet">Packet</SelectItem>
                                      <SelectItem value="Piece">Piece</SelectItem>
                                      <SelectItem value="Box">Box</SelectItem>
                                      <SelectItem value="Litre">Litre</SelectItem>
                                      <SelectItem value="Metre">Metre</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {itemErrors?.unit && <FieldError errors={[itemErrors.unit]} />}
                            </TableCell>
                            <TableCell className="py-4">
                              <Controller
                                name={`items.${index}.unit_price`}
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value) || 0;
                                      field.onChange(value);
                                      updateItemTotal(index);
                                    }}
                                    disabled={isPending}
                                    className="h-10"
                                  />
                                )}
                              />
                              {itemErrors?.unit_price && (
                                <FieldError errors={[itemErrors.unit_price]} />
                              )}
                            </TableCell>
                            <TableCell className="py-4 text-base font-medium">
                              {item?.total?.toFixed(2) || '0.00'}
                            </TableCell>
                            <TableCell className="py-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={isPending}
                              >
                                <TrashIcon className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              {errors.items && typeof errors.items === 'object' && 'root' in errors.items && (
                <FieldError errors={[errors.items.root]} />
              )}
              <div className="text-right text-base font-semibold pt-2">
                Total Amount: ₹{totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || fields.length === 0}>
              {isPending ? 'Saving...' : receipt ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
