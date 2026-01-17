"use client";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { PaymentInFormPage } from "@/features/payment-in/components/payment-in-form-page";

export default function NewPaymentInPage() {
  return (
    <ProtectedRoute>
      <PaymentInFormPage />
    </ProtectedRoute>
  );
}
