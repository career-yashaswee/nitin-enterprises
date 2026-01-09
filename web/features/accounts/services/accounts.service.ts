import { supabase } from '@/lib/supabase/client';
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types';

export const accountsService = {
  async getAll(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreateAccountInput): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateAccountInput): Promise<Account> {
    const { id, ...updateData } = input;
    const { data, error } = await supabase
      .from('accounts')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  },
};
