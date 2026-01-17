"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { GoodsInFormPage } from "@/features/goods-in/components/goods-in-form-page";

export default function NewGoodsInPage() {
  return (
    <ProtectedRoute>
      <GoodsInFormPage />
    </ProtectedRoute>
  );
}
