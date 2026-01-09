"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { GoodsOutList } from "@/features/goods-out/components/goods-out-list";
import { GoodsOutForm } from "@/features/goods-out/components/goods-out-form";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import type { GoodsOutReceiptWithItems } from "@/features/goods-out/types";

export default function GoodsOutPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] =
    useState<GoodsOutReceiptWithItems | null>(null);

  useEffect(() => {
    const handleEditGoodsOut = (
      event: CustomEvent<GoodsOutReceiptWithItems>
    ) => {
      setEditingReceipt(event.detail);
      setFormOpen(true);
    };

    window.addEventListener(
      "edit-goods-out",
      handleEditGoodsOut as EventListener
    );
    return () => {
      window.removeEventListener(
        "edit-goods-out",
        handleEditGoodsOut as EventListener
      );
    };
  }, []);

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingReceipt(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Goods Out</h1>
            <p className="text-sm text-muted-foreground">
              Record goods sold to accounts
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon className="size-4" />
            Add Receipt
          </Button>
        </div>
        <GoodsOutList />
        <GoodsOutForm
          open={formOpen}
          onOpenChange={handleFormClose}
          receipt={editingReceipt}
        />
      </div>
    </ProtectedRoute>
  );
}
