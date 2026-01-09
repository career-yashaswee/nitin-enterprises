"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { PaymentInList } from "@/features/payment-in/components/payment-in-list";
import { PaymentInForm } from "@/features/payment-in/components/payment-in-form";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import type { PaymentInWithRelations } from "@/features/payment-in/types";

export default function PaymentInPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<PaymentInWithRelations | null>(null);

  useEffect(() => {
    const handleEditPaymentIn = (
      event: CustomEvent<PaymentInWithRelations>
    ) => {
      setEditingPayment(event.detail);
      setFormOpen(true);
    };

    window.addEventListener(
      "edit-payment-in",
      handleEditPaymentIn as EventListener
    );
    return () => {
      window.removeEventListener(
        "edit-payment-in",
        handleEditPaymentIn as EventListener
      );
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
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment In</h1>
            <p className="text-sm text-muted-foreground">
              Record payments received from accounts
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon className="size-4" />
            Add Payment
          </Button>
        </div>
        <PaymentInList />
        <PaymentInForm
          open={formOpen}
          onOpenChange={handleFormClose}
          payment={editingPayment}
        />
      </div>
    </ProtectedRoute>
  );
}
