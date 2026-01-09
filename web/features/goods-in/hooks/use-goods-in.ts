'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsInService } from '../services/goods-in.service';
import type { CreateGoodsInReceiptInput, UpdateGoodsInReceiptInput } from '../types';

export function useGoodsIn() {
  return useQuery({
    queryKey: ['goods-in'],
    queryFn: () => goodsInService.getAll(),
  });
}

export function useGoodsInReceipt(id: string) {
  return useQuery({
    queryKey: ['goods-in', id],
    queryFn: () => goodsInService.getById(id),
    enabled: !!id,
  });
}

export function useCreateGoodsIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGoodsInReceiptInput) => goodsInService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goods-in'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateGoodsIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateGoodsInReceiptInput) => goodsInService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goods-in'] });
      queryClient.invalidateQueries({ queryKey: ['goods-in', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteGoodsIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsInService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goods-in'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
