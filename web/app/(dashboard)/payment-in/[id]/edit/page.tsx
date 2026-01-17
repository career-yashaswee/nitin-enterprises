"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { PaymentInFormPage } from "@/features/payment-in/components/payment-in-form-page";

export default function EditPaymentInPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute>
      <PaymentInFormPage paymentId={id} />
    </ProtectedRoute>
  );
}
