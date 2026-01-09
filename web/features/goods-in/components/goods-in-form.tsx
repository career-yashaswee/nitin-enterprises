'use client';

import { useEffect, useState } from 'react';
import { useCreateGoodsIn, useUpdateGoodsIn } from '../hooks/use-goods-in';
import { useAccounts } from '@/features/accounts/hooks/use-accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import type { GoodsInReceiptWithItems, GoodsInItem } from '../types';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';

interface GoodsInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: GoodsInReceiptWithItems | null;
}

export function GoodsInForm({ open, onOpenChange, receipt }: GoodsInFormProps) {
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Omit<GoodsInItem, 'id' | 'receipt_id' | 'created_at'>[]>([]);

  const { data: accounts } = useAccounts();
  const createGoodsIn = useCreateGoodsIn();
  const updateGoodsIn = useUpdateGoodsIn();

  useEffect(() => {
    if (receipt) {
      setAccountId(receipt.account_id);
      setDate(receipt.date);
      setNotes(receipt.notes || '');
      setItems(
        receipt.items.map((item) => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        }))
      );
    } else {
      setAccountId('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setItems([]);
    }
  }, [receipt, open]);

  const addItem = () => {
    setItems([...items, { item_name: '', quantity: 0, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unit_price);
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      toast.error('Please select an account');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      if (receipt) {
        await updateGoodsIn.mutateAsync({
          id: receipt.id,
          account_id: accountId,
          date,
          notes: notes || undefined,
          items,
        });
        toast.success('Goods In receipt updated successfully');
      } else {
        await createGoodsIn.mutateAsync({
          account_id: accountId,
          date,
          notes: notes || undefined,
          items,
        });
        toast.success('Goods In receipt created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save receipt');
    }
  };

  const isPending = createGoodsIn.isPending || updateGoodsIn.isPending;
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{receipt ? 'Edit Goods In Receipt' : 'Create Goods In Receipt'}</DialogTitle>
          <DialogDescription>
            {receipt ? 'Update goods in receipt information' : 'Record goods received from an account'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={isPending}>
                  <PlusIcon className="size-4" />
                  Add Item
                </Button>
              </div>
              {items.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={item.item_name}
                              onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                              placeholder="Item name"
                              required
                              disabled={isPending}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              required
                              disabled={isPending}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              required
                              disabled={isPending}
                            />
                          </TableCell>
                          <TableCell>{item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              disabled={isPending}
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="text-right text-sm font-medium">
                Total Amount: {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || items.length === 0}>
              {isPending ? 'Saving...' : receipt ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
