'use client';

import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useGoodsOut, useDeleteGoodsOut } from '../hooks/use-goods-out';
import { useRole } from '@/features/auth/hooks/use-role';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { GoodsOutReceiptWithItems } from '../types';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { GoodsOutPrint } from './goods-out-print';

export function GoodsOutList() {
  const { data: receipts, isLoading } = useGoodsOut();
  const { canDelete } = useRole();
  const deleteGoodsOut = useDeleteGoodsOut();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<GoodsOutReceiptWithItems | null>(null);

  const columns = useMemo<ColumnDef<GoodsOutReceiptWithItems>[]>(
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
        accessorKey: 'total_amount',
        header: 'Total Amount',
        cell: ({ row }) => `₹${row.original.total_amount.toFixed(2)}`,
      },
      {
        accessorKey: 'items',
        header: 'Items',
        cell: ({ row }) => row.original.items.length,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <GoodsOutPrint receipt={row.original} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const event = new CustomEvent('edit-goods-out', { detail: row.original });
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
                  setReceiptToDelete(row.original);
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
    data: receipts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDelete = async () => {
    if (!receiptToDelete) return;
    try {
      await deleteGoodsOut.mutateAsync(receiptToDelete.id);
      toast.success('Goods Out receipt deleted successfully');
      setDeleteDialogOpen(false);
      setReceiptToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete receipt');
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading receipts...</div>;
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
                  No receipts found
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
            <DialogTitle>Delete Goods Out Receipt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this receipt? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteGoodsOut.isPending}>
              {deleteGoodsOut.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
