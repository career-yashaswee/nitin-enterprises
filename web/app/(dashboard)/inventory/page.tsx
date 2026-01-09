"use client";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { InventoryList } from "@/features/inventory/components/inventory-list";

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            View current inventory levels
          </p>
        </div>
        <InventoryList />
      </div>
    </ProtectedRoute>
  );
}
