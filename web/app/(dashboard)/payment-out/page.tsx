'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { PaymentOutList } from '@/features/payment-out/components/payment-out-list';
import { PaymentOutForm } from '@/features/payment-out/components/payment-out-form';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@phosphor-icons/react';
import type { PaymentOutWithRelations } from '@/features/payment-out/types';

export default function PaymentOutPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentOutWithRelations | null>(null);

  useEffect(() => {
    const handleEditPaymentOut = (event: CustomEvent<PaymentOutWithRelations>) => {
      setEditingPayment(event.detail);
      setFormOpen(true);
    };

    window.addEventListener('edit-payment-out', handleEditPaymentOut as EventListener);
    return () => {
      window.removeEventListener('edit-payment-out', handleEditPaymentOut as EventListener);
    };
  }, []);

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingPayment(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment Out</h1>
            <p className="text-sm text-muted-foreground">Record payments made to accounts</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon className="size-4" />
            Add Payment
          </Button>
        </div>
        <PaymentOutList />
        <PaymentOutForm open={formOpen} onOpenChange={handleFormClose} payment={editingPayment} />
      </div>
    </ProtectedRoute>
  );
}
