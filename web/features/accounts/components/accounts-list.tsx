'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useAccounts, useDeleteAccount } from '../hooks/use-accounts';
import { useGoodsIn } from '@/features/goods-in/hooks/use-goods-in';
import { useGoodsOut } from '@/features/goods-out/hooks/use-goods-out';
import { usePaymentIn } from '@/features/payment-in/hooks/use-payment-in';
import { usePaymentOut } from '@/features/payment-out/hooks/use-payment-out';
import { useRole } from '@/features/auth/hooks/use-role';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Account } from '../types';
import { calculateAccountBalances } from '../utils/payment-balance';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';

type FilterType = 'all' | 'to-collect' | 'to-pay';

export function AccountsList() {
  const { data: accounts, isLoading } = useAccounts();
  const { data: goodsIn } = useGoodsIn();
  const { data: goodsOut } = useGoodsOut();
  const { data: paymentsIn } = usePaymentIn();
  const { data: paymentsOut } = usePaymentOut();
  const { canDelete } = useRole();
  const deleteAccount = useDeleteAccount();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Calculate balances for all accounts
  const accountBalances = useMemo(() => {
    if (!accounts || !goodsIn || !goodsOut || !paymentsIn || !paymentsOut) {
      return [];
    }
    return calculateAccountBalances(accounts, goodsIn, goodsOut, paymentsIn, paymentsOut);
  }, [accounts, goodsIn, goodsOut, paymentsIn, paymentsOut]);

  // Filter accounts based on payment status
  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    if (filter === 'all') return accounts;
    
    return accounts.filter((account) => {
      const balance = accountBalances.find((b) => b.accountId === account.id);
      if (!balance) return false;
      
      if (filter === 'to-collect') {
        return balance.balanceToCollect > 0;
      }
      if (filter === 'to-pay') {
        return balance.balanceToPay > 0;
      }
      return true;
    });
  }, [accounts, filter, accountBalances]);

  const getAccountBalance = (accountId: string) => {
    return accountBalances.find((b) => b.accountId === accountId);
  };

  const columns = useMemo<ColumnDef<Account>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'contact_info',
        header: 'Contact Info',
      },
      {
        accessorKey: 'address',
        header: 'Address',
      },
      {
        id: 'balance',
        header: 'Payment Status',
        cell: ({ row }) => {
          const balance = getAccountBalance(row.original.id);
          if (!balance) return '-';
          
          return (
            <div className="flex flex-col gap-1">
              {balance.balanceToCollect > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  To Collect: ₹{balance.balanceToCollect.toFixed(2)}
                </Badge>
              )}
              {balance.balanceToPay > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  To Pay: ₹{balance.balanceToPay.toFixed(2)}
                </Badge>
              )}
              {balance.balanceToCollect === 0 && balance.balanceToPay === 0 && (
                <Badge variant="secondary">Settled</Badge>
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Handle edit - will be passed to parent
                const event = new CustomEvent('edit-account', {
                  detail: row.original,
                });
                window.dispatchEvent(event);
              }}
            >
              <PencilIcon className="size-4" />
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAccountToDelete(row.original);
                  setDeleteDialogOpen(true);
                }}
              >
                <TrashIcon className="size-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canDelete]
  );

  const table = useReactTable({
    data: filteredAccounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleDelete = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccount.mutateAsync(accountToDelete.id);
      toast.success('Account deleted successfully');
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading accounts...</div>;
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="to-collect">Payments to Collect</SelectItem>
            <SelectItem value="to-pay">Payments to Send</SelectItem>
          </SelectContent>
        </Select>
        {filter !== 'all' && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.getCanSort()
                        ? (
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </button>
                          )
                        : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                      No accounts found
                    </TableCell>
                  </TableRow>
                )
              : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {accountToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteAccount.isPending}>
              {deleteAccount.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
