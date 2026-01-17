"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { GoodsOutFormPage } from "@/features/goods-out/components/goods-out-form-page";

export default function NewGoodsOutPage() {
  return (
    <ProtectedRoute>
      <GoodsOutFormPage />
    </ProtectedRoute>
  );
}
