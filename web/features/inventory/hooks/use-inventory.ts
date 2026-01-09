'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getAll(),
  });
}

export function useInventoryItem(itemName: string) {
  return useQuery({
    queryKey: ['inventory', itemName],
    queryFn: () => inventoryService.getByItemName(itemName),
    enabled: !!itemName,
  });
}
