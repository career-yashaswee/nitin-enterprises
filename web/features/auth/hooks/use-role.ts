'use client';

import { useAuth } from './use-auth';
import type { UserRole } from '../types';

export function useRole() {
  const { role, isAuthenticated } = useAuth();

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (!isAuthenticated || !role) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('manager');
  const canDelete = () => isAdmin(); // Only admin can delete

  return {
    role,
    hasRole,
    isAdmin: isAdmin(),
    isManager: isManager(),
    canDelete: canDelete(),
  };
}
