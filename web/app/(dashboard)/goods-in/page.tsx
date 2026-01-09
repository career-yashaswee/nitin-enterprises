'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { GoodsInList } from '@/features/goods-in/components/goods-in-list';
import { GoodsInForm } from '@/features/goods-in/components/goods-in-form';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@phosphor-icons/react';
import type { GoodsInReceiptWithItems } from '@/features/goods-in/types';

export default function GoodsInPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<GoodsInReceiptWithItems | null>(null);

  useEffect(() => {
    const handleEditGoodsIn = (event: CustomEvent<GoodsInReceiptWithItems>) => {
      setEditingReceipt(event.detail);
      setFormOpen(true);
    };

    window.addEventListener('edit-goods-in', handleEditGoodsIn as EventListener);
    return () => {
      window.removeEventListener('edit-goods-in', handleEditGoodsIn as EventListener);
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
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Goods In</h1>
            <p className="text-sm text-muted-foreground">Record goods received from accounts</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon className="size-4" />
            Add Receipt
          </Button>
        </div>
        <GoodsInList />
        <GoodsInForm open={formOpen} onOpenChange={handleFormClose} receipt={editingReceipt} />
      </div>
    </ProtectedRoute>
  );
}
