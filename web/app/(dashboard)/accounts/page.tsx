'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { AccountsList } from '@/features/accounts/components/accounts-list';
import { AccountForm } from '@/features/accounts/components/account-form';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@phosphor-icons/react';
import type { Account } from '@/features/accounts/types';

export default function AccountsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    const handleEditAccount = (event: CustomEvent<Account>) => {
      setEditingAccount(event.detail);
      setFormOpen(true);
    };

    window.addEventListener('edit-account', handleEditAccount as EventListener);
    return () => {
      window.removeEventListener('edit-account', handleEditAccount as EventListener);
    };
  }, []);

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingAccount(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Accounts</h1>
            <p className="text-sm text-muted-foreground">Manage your accounts</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon className="size-4" />
            Add Account
          </Button>
        </div>
        <AccountsList />
        <AccountForm open={formOpen} onOpenChange={handleFormClose} account={editingAccount} />
      </div>
    </ProtectedRoute>
  );
}
