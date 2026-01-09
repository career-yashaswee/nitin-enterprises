import type { UserRole } from "../types";

export function canDelete(role: UserRole | null): boolean {
  return role === "admin";
}

export function canCreate(role: UserRole | null): boolean {
  return role === "admin" || role === "manager";
}

export function canUpdate(role: UserRole | null): boolean {
  return role === "admin" || role === "manager";
}

export function canRead(role: UserRole | null): boolean {
  return role === "admin" || role === "manager";
}
