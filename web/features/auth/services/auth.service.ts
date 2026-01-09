import { supabase } from '@/lib/supabase/client';
import type { UserRole } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
}

export const authService = {
  async signIn(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  },

  async signUp(signUpData: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        data: {
          role: signUpData.role,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getUserRole(userId: string): Promise<UserRole | null> {
    // Try to get role from user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Fallback to user metadata
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return (user?.user_metadata?.role as UserRole) || null;
    }

    return data.role as UserRole;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};
