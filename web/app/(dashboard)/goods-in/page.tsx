"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { GoodsInList } from "@/features/goods-in/components/goods-in-list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import { useKeyboardShortcut } from "@/features/utilities/keyboard-shortcuts/hooks/use-keyboard-shortcut";
import { getModifierKey } from "@/features/utilities/keyboard-shortcuts/hooks/use-platform";
import { Kbd } from "@/components/ui/kbd";

export default function GoodsInPage() {
  const router = useRouter();

  const handleNewReceipt = () => {
    router.push("/goods-in/new");
  };

  // Keyboard shortcut: Ctrl/Cmd + N to create new receipt
  useKeyboardShortcut("mod+n", handleNewReceipt);

  return (
    <ProtectedRoute>
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Goods In</h1>
            <p className="text-sm text-muted-foreground">
              Record goods received from accounts
            </p>
          </div>
          <Button onClick={handleNewReceipt}>
            <PlusIcon className="size-4" />
            Add Receipt <Kbd>{getModifierKey()}</Kbd>+<Kbd>N</Kbd>
          </Button>
        </div>
        <GoodsInList />
      </div>
    </ProtectedRoute>
  );
}
