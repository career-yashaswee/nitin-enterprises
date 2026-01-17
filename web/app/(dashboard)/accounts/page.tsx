"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AccountsList } from "@/features/accounts/components/accounts-list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import { useKeyboardShortcut } from "@/features/utilities/keyboard-shortcuts/hooks/use-keyboard-shortcut";
import { getModifierKey } from "@/features/utilities/keyboard-shortcuts/hooks/use-platform";
import { Kbd } from "@/components/ui/kbd";

export default function AccountsPage() {
  const router = useRouter();

  const handleNewAccount = () => {
    router.push("/accounts/new");
  };

  useKeyboardShortcut("mod+n", handleNewAccount);

  return (
    <ProtectedRoute>
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Accounts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your accounts
            </p>
          </div>
          <Button onClick={handleNewAccount}>
            <PlusIcon className="size-4" />
            Add Account <Kbd>{getModifierKey()}</Kbd>+<Kbd>N</Kbd>
          </Button>
        </div>
        <AccountsList />
      </div>
    </ProtectedRoute>
  );
}
