import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: 'admin' | 'manager' | null;
  setUser: (user: User | null) => void;
  setRole: (role: 'admin' | 'manager' | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  clearAuth: () => set({ user: null, role: null }),
}));
