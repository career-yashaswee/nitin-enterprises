'use client';

import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useUsers, useUpdateUserRole } from '../hooks/use-users';
import { useRole } from '@/features/auth/hooks/use-role';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { User } from '../types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function UsersList() {
  const { data: users, isLoading } = useUsers();
  const { isAdmin } = useRole();
  const updateUserRole = useUpdateUserRole();

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'manager') => {
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole });
      toast.success('User role updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const user = row.original;
          if (!isAdmin) {
            return (
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role.toUpperCase()}
              </Badge>
            );
          }
          return (
            <Select
              value={user.role}
              onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'manager')}
              disabled={updateUserRole.isPending}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => format(new Date(row.original.created_at), 'MMM dd, yyyy'),
      },
    ],
    [isAdmin, updateUserRole.isPending]
  );

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading users...</div>;
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
                No users found
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
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
