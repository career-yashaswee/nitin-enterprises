'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAccount, useUpdateAccount, useAccount } from '../hooks/use-accounts';
import { useThrottledCallback } from '@/lib/hooks/use-throttled-callback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useKeyboardShortcut } from '@/features/utilities/keyboard-shortcuts/hooks/use-keyboard-shortcut';
import { getModifierKey } from '@/features/utilities/keyboard-shortcuts/hooks/use-platform';
import { Kbd } from '@/components/ui/kbd';

interface AccountFormPageProps {
  accountId?: string;
}

export function AccountFormPage({ accountId }: AccountFormPageProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'creditor' | 'debitor'>('debitor');
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!accountId;
  const { data: account, isLoading: isLoadingAccount } = useAccount(accountId || '');
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  useEffect(() => {
    if (account) {
      setName(account.name);
      setContactInfo(account.contact_info || '');
      setAddress(account.address || '');
      setType(account.type || 'debitor');
    } else if (!isEditMode) {
      setName('');
      setContactInfo('');
      setAddress('');
      setType('debitor');
    }
  }, [account, isEditMode]);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleSubmitInternal = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      name,
      contact_info: contactInfo || undefined,
      address: address || undefined,
      type,
    };

    try {
      if (isEditMode && accountId) {
        await updateAccount.mutateAsync({ ...input, id: accountId });
        toast.success('Account updated successfully');
      } else {
        await createAccount.mutateAsync(input);
        toast.success('Account created successfully');
      }
      router.push('/accounts');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save account');
    }
  };

  const handleSubmit = useThrottledCallback(handleSubmitInternal, 1000);

  const handleCancel = () => {
    router.push('/accounts');
  };

  useKeyboardShortcut('escape', handleCancel);
  useKeyboardShortcut('mod+enter', () => {
    if (formRef.current) {
      const submitButton = formRef.current.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
  });

  const isPending = createAccount.isPending || updateAccount.isPending || isLoadingAccount;

  if (isEditMode && isLoadingAccount) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              aria-label="Go back"
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditMode ? 'Edit Account' : 'Create Account'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update account information' : 'Add a new account to the system'}
              </p>
            </div>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                ref={firstInputRef}
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
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={(value) => setType(value as 'creditor' | 'debitor')} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debitor">Debitor</SelectItem>
                  <SelectItem value="creditor">Creditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel <Kbd>Esc</Kbd>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditMode ? 'Update' : 'Create'} <Kbd>{getModifierKey()}</Kbd>+<Kbd>Enter</Kbd>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
