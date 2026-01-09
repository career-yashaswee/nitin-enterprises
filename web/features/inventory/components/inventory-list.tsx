'use client';

import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useInventory } from '../hooks/use-inventory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function InventoryList() {
  const { data: inventory, isLoading } = useInventory();

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'item_name',
        header: 'Item Name',
      },
      {
        accessorKey: 'quantity_in',
        header: 'Quantity In',
        cell: ({ row }) => row.original.quantity_in.toFixed(2),
      },
      {
        accessorKey: 'quantity_out',
        header: 'Quantity Out',
        cell: ({ row }) => row.original.quantity_out.toFixed(2),
      },
      {
        accessorKey: 'available_quantity',
        header: 'Available Quantity',
        cell: ({ row }) => (
          <span className={row.original.available_quantity < 0 ? 'text-destructive font-medium' : ''}>
            {row.original.available_quantity.toFixed(2)}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: inventory || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading inventory...</div>;
  }

  return (
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
                No inventory items found
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
  );
}
