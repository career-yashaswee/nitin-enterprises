"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { PaymentOutFormPage } from "@/features/payment-out/components/payment-out-form-page";

export default function EditPaymentOutPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute>
      <PaymentOutFormPage paymentId={id} />
    </ProtectedRoute>
  );
}
