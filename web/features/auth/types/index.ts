export type UserRole = 'admin' | 'manager';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
