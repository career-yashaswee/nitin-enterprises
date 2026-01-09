import { supabase } from '@/lib/supabase/client';
import type { User, UpdateUserRoleInput } from '../types';

export const usersService = {
  async getAll(): Promise<User[]> {
    // Use the database function to get all users
    const { data, error } = await supabase.rpc('get_all_users');

    if (error) throw error;
    
    return (data || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role as 'admin' | 'manager',
      created_at: user.created_at,
    }));
  },

  async updateRole(input: UpdateUserRoleInput): Promise<void> {
    // Check if user_role exists
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', input.userId)
      .single();

    if (existing) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: input.role })
        .eq('user_id', input.userId);
      
      if (error) throw error;
    } else {
      // Create new role entry
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: input.userId,
          role: input.role,
        });
      
      if (error) throw error;
    }

    // Also update user metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { role: input.role },
    });
    
    if (metadataError) throw metadataError;
  },
};
