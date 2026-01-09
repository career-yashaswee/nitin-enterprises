'use client';

import { useEffect, useState } from 'react';
import { useCreateAccount, useUpdateAccount } from '../hooks/use-accounts';
import { useThrottledCallback } from '@/lib/hooks/use-throttled-callback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Account, CreateAccountInput } from '../types';

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
}

export function AccountForm({ open, onOpenChange, account }: AccountFormProps) {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [address, setAddress] = useState('');
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  useEffect(() => {
    if (account) {
      setName(account.name);
      setContactInfo(account.contact_info || '');
      setAddress(account.address || '');
    } else {
      setName('');
      setContactInfo('');
      setAddress('');
    }
  }, [account, open]);

  const handleSubmitInternal = async (e: React.FormEvent) => {
    e.preventDefault();

    const input: CreateAccountInput = {
      name,
      contact_info: contactInfo || undefined,
      address: address || undefined,
    };

    try {
      if (account) {
        await updateAccount.mutateAsync({ ...input, id: account.id });
        toast.success('Account updated successfully');
      } else {
        await createAccount.mutateAsync(input);
        toast.success('Account created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save account');
    }
  };

  // Throttle form submission to prevent rapid clicks
  const handleSubmit = useThrottledCallback(handleSubmitInternal, 1000);

  const isPending = createAccount.isPending || updateAccount.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {account ? 'Update account information' : 'Add a new account to the system'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_info">Contact Info</Label>
              <Input
                id="contact_info"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : account ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
