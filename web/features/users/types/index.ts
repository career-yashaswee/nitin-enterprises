export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager';
  created_at: string;
}

export interface UpdateUserRoleInput {
  userId: string;
  role: 'admin' | 'manager';
}
