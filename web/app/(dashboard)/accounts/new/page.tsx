"use client";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AccountFormPage } from "@/features/accounts/components/account-form-page";

export default function NewAccountPage() {
  return (
    <ProtectedRoute>
      <AccountFormPage />
    </ProtectedRoute>
  );
}
