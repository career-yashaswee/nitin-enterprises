"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { GoodsOutFormPage } from "@/features/goods-out/components/goods-out-form-page";

export default function EditGoodsOutPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute>
      <GoodsOutFormPage receiptId={id} />
    </ProtectedRoute>
  );
}
