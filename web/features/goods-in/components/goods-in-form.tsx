"use client";

import { useEffect, useState } from "react";
import { useCreateGoodsIn, useUpdateGoodsIn } from "../hooks/use-goods-in";
import { AccountCombobox } from "@/features/accounts/components/account-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { GoodsInReceiptWithItems, GoodsInItem } from "../types";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { StatefulButton } from "@/features/utilities/stateful-button";

interface GoodsInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: GoodsInReceiptWithItems | null;
}

export function GoodsInForm({ open, onOpenChange, receipt }: GoodsInFormProps) {
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    Omit<GoodsInItem, "id" | "receipt_id" | "created_at">[]
  >([]);

  const createGoodsIn = useCreateGoodsIn();
  const updateGoodsIn = useUpdateGoodsIn();

  useEffect(() => {
    if (receipt) {
      setAccountId(receipt.account_id);
      setDate(receipt.date);
      setNotes(receipt.notes || "");
      setItems(
        receipt.items.map((item) => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit || "Kg",
          unit_price: item.unit_price,
          total: item.total,
        }))
      );
    } else {
      setAccountId("");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setItems([]);
    }
  }, [receipt, open]);

  const addItem = () => {
    setItems([
      ...items,
      { item_name: "", quantity: 0, unit: "Kg", unit_price: 0, total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unit_price") {
      newItems[index].total =
        Number(newItems[index].quantity) * Number(newItems[index].unit_price);
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is now handled by StatefulButton
  };

  const isPending = createGoodsIn.isPending || updateGoodsIn.isPending;
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {receipt ? "Edit Goods In Receipt" : "Create Goods In Receipt"}
          </DialogTitle>
          <DialogDescription>
            {receipt
              ? "Update goods in receipt information"
              : "Record goods received from an account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              <AccountCombobox
                value={accountId}
                onValueChange={setAccountId}
                disabled={isPending}
                label="Account"
                required
                placeholder="Search accounts..."
              />
              <div className="space-y-3">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={isPending}
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                rows={4}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Items *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={isPending}
                >
                  <PlusIcon className="size-4" />
                  Add Item
                </Button>
              </div>
              {items.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="py-4">Item Name</TableHead>
                        <TableHead className="py-4">Quantity</TableHead>
                        <TableHead className="py-4">Unit</TableHead>
                        <TableHead className="py-4">Unit Price</TableHead>
                        <TableHead className="py-4">Total</TableHead>
                        <TableHead className="w-[60px] py-4"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="py-4">
                            <Input
                              value={item.item_name}
                              onChange={(e) =>
                                updateItem(index, "item_name", e.target.value)
                              }
                              placeholder="Item name"
                              required
                              disabled={isPending}
                              className="h-10"
                            />
                          </TableCell>
                          <TableCell className="py-4">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              required
                              disabled={isPending}
                              className="h-10"
                            />
                          </TableCell>
                          <TableCell className="py-4">
                            <Select
                              value={item.unit || "Kg"}
                              onValueChange={(value) =>
                                updateItem(index, "unit", value)
                              }
                              disabled={isPending}
                            >
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
                          </TableCell>
                          <TableCell className="py-4">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unit_price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              required
                              disabled={isPending}
                              className="h-10"
                            />
                          </TableCell>
                          <TableCell className="py-4 text-base font-medium">
                            {item.total.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-4">
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
              <div className="text-right text-base font-semibold pt-2">
                Total Amount: ₹{totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <StatefulButton
              type="submit"
              disabled={items.length === 0}
              onAction={async () => {
                if (!accountId) {
                  toast.error("Please select an account");
                  return;
                }
                if (items.length === 0) {
                  toast.error("Please add at least one item");
                  return;
                }

                if (receipt) {
                  await updateGoodsIn.mutateAsync({
                    id: receipt.id,
                    account_id: accountId,
                    date,
                    notes: notes || undefined,
                    items,
                  });
                  toast.success("Goods In receipt updated successfully");
                } else {
                  await createGoodsIn.mutateAsync({
                    account_id: accountId,
                    date,
                    notes: notes || undefined,
                    items,
                  });
                  toast.success("Goods In receipt created successfully");
                }
                onOpenChange(false);
              }}
              onSuccess={() => {
                // Success is already handled in onAction
              }}
              onError={(error) => {
                toast.error(error.message || "Failed to save receipt");
              }}
            >
              {receipt ? "Update" : "Create"}
            </StatefulButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
