'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { usePaymentOut, useDeletePaymentOut } from '../hooks/use-payment-out';
import { useRole } from '@/features/auth/hooks/use-role';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { PaymentOutWithRelations } from '../types';
import { PencilIcon, TrashIcon, MagnifyingGlass } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { EmptyState } from '@/features/utilities/empty-states';
import { ExportButton } from '@/features/utilities/export-button';
import { RefreshButton } from '@/features/utilities/refresh-button';
import { useSearchInput } from '@/features/utilities/search-input';

export function PaymentOutList() {
  const router = useRouter();
  const { data: payments, isLoading } = usePaymentOut();
  const { canDelete } = useRole();
  const deletePaymentOut = useDeletePaymentOut();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentOutWithRelations | null>(null);

  const { query, setQuery, results } = useSearchInput({
    data: payments || [],
    searchKeys: ['account.name', 'payment_mode', 'id'],
    enableUrlSync: true,
  });

  const columns = useMemo<ColumnDef<PaymentOutWithRelations>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.date), 'MMM dd, yyyy'),
      },
      {
        accessorKey: 'account',
        header: 'Account',
        cell: ({ row }) => row.original.account?.name || 'N/A',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => `₹${row.original.amount.toFixed(2)}`,
      },
      {
        accessorKey: 'payment_mode',
        header: 'Payment Mode',
        cell: ({ row }) => row.original.payment_mode || 'Cash',
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
                router.push(`/payment-out/${row.original.id}/edit`);
              }}
              aria-label="Edit payment"
            >
              <PencilIcon className="size-4" />
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setPaymentToDelete(row.original);
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
    data: results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    try {
      await deletePaymentOut.mutateAsync(paymentToDelete.id);
      toast.success('Payment Out deleted successfully');
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete payment');
    }
  };

  if (isLoading) {
    return <EmptyState type="loading" />;
  }

  const hasData = results.length > 0;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search payments..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton queryKeys={[['payment-out']]} resource="payment out records" />
            <ExportButton
              fetchData={async () => results}
              filename="payment-out"
              resource="payment out records"
            />
          </div>
        </div>

        {!hasData ? (
          <EmptyState
            type={query ? "search" : "no-data"}
            title={query ? "No results found" : "No payments found"}
            description={query ? "Try adjusting your search criteria." : "There are no payment out records to display."}
            actionLabel={query ? "Clear search" : undefined}
            onAction={query ? () => setQuery('') : undefined}
          />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletePaymentOut.isPending}>
              {deletePaymentOut.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
