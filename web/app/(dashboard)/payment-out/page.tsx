"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { PaymentOutList } from "@/features/payment-out/components/payment-out-list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import { useKeyboardShortcut } from "@/features/utilities/keyboard-shortcuts/hooks/use-keyboard-shortcut";
import { getModifierKey } from "@/features/utilities/keyboard-shortcuts/hooks/use-platform";
import { Kbd } from "@/components/ui/kbd";

export default function PaymentOutPage() {
  const router = useRouter();

  const handleNewPayment = () => {
    router.push("/payment-out/new");
  };

  useKeyboardShortcut("mod+n", handleNewPayment);

  return (
    <ProtectedRoute>
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment Out</h1>
            <p className="text-sm text-muted-foreground">
              Record payments made to accounts
            </p>
          </div>
          <Button onClick={handleNewPayment}>
            <PlusIcon className="size-4" />
            Add Payment <Kbd>{getModifierKey()}</Kbd>+<Kbd>N</Kbd>
          </Button>
        </div>
        <PaymentOutList />
      </div>
    </ProtectedRoute>
  );
}
