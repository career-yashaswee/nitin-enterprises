'use client';

import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { usePaymentOut, useDeletePaymentOut } from '../hooks/use-payment-out';
import { useRole } from '@/features/auth/hooks/use-role';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { PaymentOutWithRelations } from '../types';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import { format } from 'date-fns';

export function PaymentOutList() {
  const { data: payments, isLoading } = usePaymentOut();
  const { canDelete } = useRole();
  const deletePaymentOut = useDeletePaymentOut();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentOutWithRelations | null>(null);

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
                const event = new CustomEvent('edit-payment-out', { detail: row.original });
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
    data: payments || [],
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
    return <div className="text-sm text-muted-foreground">Loading payments...</div>;
  }

  return (
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
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
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
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
