"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { GoodsInFormPage } from "@/features/goods-in/components/goods-in-form-page";

export default function EditGoodsInPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute>
      <GoodsInFormPage receiptId={id} />
    </ProtectedRoute>
  );
}
