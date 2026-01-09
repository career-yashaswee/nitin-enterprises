import { supabase } from '@/lib/supabase/client';
import type { InventoryItem } from '../types';

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('item_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByItemName(itemName: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('item_name', itemName)
      .single();

    if (error) throw error;
    return data;
  },
};
