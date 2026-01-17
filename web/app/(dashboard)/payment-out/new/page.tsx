"use client";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { PaymentOutFormPage } from "@/features/payment-out/components/payment-out-form-page";

export default function NewPaymentOutPage() {
  return (
    <ProtectedRoute>
      <PaymentOutFormPage />
    </ProtectedRoute>
  );
}
