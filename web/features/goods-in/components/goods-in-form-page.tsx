"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateGoodsIn, useUpdateGoodsIn, useGoodsInReceipt } from "../hooks/use-goods-in";
import { AccountCombobox } from "@/features/accounts/components/account-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { GoodsInItem } from "../types";
import { PlusIcon, TrashIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { StatefulButton } from "@/features/utilities/stateful-button";
import { useKeyboardShortcut } from "@/features/utilities/keyboard-shortcuts/hooks/use-keyboard-shortcut";
import { getModifierKey } from "@/features/utilities/keyboard-shortcuts/hooks/use-platform";
import { Kbd } from "@/components/ui/kbd";

interface GoodsInFormPageProps {
  receiptId?: string;
}

export function GoodsInFormPage({ receiptId }: GoodsInFormPageProps) {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    Omit<GoodsInItem, "id" | "receipt_id" | "created_at">[]
  >([]);
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const { data: receipt, isLoading: isLoadingReceipt } = useGoodsInReceipt(receiptId || "");
  const createGoodsIn = useCreateGoodsIn();
  const updateGoodsIn = useUpdateGoodsIn();

  const isEditMode = !!receiptId;

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
    } else if (!isEditMode) {
      setAccountId("");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setItems([]);
    }
  }, [receipt, isEditMode]);

  useEffect(() => {
    // Focus first input on mount
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

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

  const handleCancel = () => {
    router.push("/goods-in");
  };

  // Keyboard shortcuts
  useKeyboardShortcut("escape", handleCancel);
  useKeyboardShortcut("mod+enter", () => {
    if (formRef.current) {
      const submitButton = formRef.current.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
  });

  const isPending = createGoodsIn.isPending || updateGoodsIn.isPending || isLoadingReceipt;
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  if (isEditMode && isLoadingReceipt) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
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
                {isEditMode ? "Edit Goods In Receipt" : "Create Goods In Receipt"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Update goods in receipt information"
                  : "Record goods received from an account"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-6">
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
                  ref={firstInputRef}
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
                              aria-label="Remove item"
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

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel <Kbd>Esc</Kbd>
            </Button>
            <StatefulButton
              type="submit"
              disabled={items.length === 0 || !accountId}
              onAction={async () => {
                if (!accountId) {
                  toast.error("Please select an account");
                  return;
                }
                if (items.length === 0) {
                  toast.error("Please add at least one item");
                  return;
                }

                if (isEditMode && receiptId) {
                  await updateGoodsIn.mutateAsync({
                    id: receiptId,
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
                router.push("/goods-in");
              }}
              onSuccess={() => {
                // Success is already handled in onAction
              }}
              onError={(error) => {
                toast.error(error.message || "Failed to save receipt");
              }}
            >
              {isEditMode ? "Update" : "Create"} <Kbd>{getModifierKey()}</Kbd>+<Kbd>Enter</Kbd>
            </StatefulButton>
          </div>
        </form>
      </div>
    </div>
  );
}
