"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AccountFormPage } from "@/features/accounts/components/account-form-page";

export default function EditAccountPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute>
      <AccountFormPage accountId={id} />
    </ProtectedRoute>
  );
}
