"use client";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { UsersList } from "@/features/users/components/users-list";
import { useRole } from "@/features/auth/hooks/use-role";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersPage() {
  const { isAdmin } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <UsersList />
      </div>
    </ProtectedRoute>
  );
}
