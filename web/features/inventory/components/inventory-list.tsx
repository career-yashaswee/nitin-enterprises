'use client';

import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useInventory } from '../hooks/use-inventory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/features/utilities/empty-states';
import { ExportButton } from '@/features/utilities/export-button';
import { RefreshButton } from '@/features/utilities/refresh-button';
import { useSearchInput } from '@/features/utilities/search-input';
import { Input } from '@/components/ui/input';
import { MagnifyingGlass } from '@phosphor-icons/react';

export function InventoryList() {
  const { data: inventory, isLoading } = useInventory();

  const { query, setQuery, results } = useSearchInput({
    data: inventory || [],
    searchKeys: ['item_name'],
    enableUrlSync: true,
  });

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

  const filteredData = results;

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return <EmptyState type="loading" />;
  }

  const hasData = filteredData.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search inventory items..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton queryKeys={[['inventory']]} resource="inventory" />
          <ExportButton
            fetchData={async () => filteredData}
            filename="inventory"
            resource="inventory"
          />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <EmptyState
          type={query ? "search" : "no-data"}
          title={query ? "No results found" : "No inventory items found"}
          description={query ? "Try adjusting your search criteria." : "There are no inventory items to display."}
          actionLabel={query ? "Clear search" : undefined}
          onAction={query ? () => setQuery('') : undefined}
        />
      ) : (
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
      )}
    </div>
  );
}
