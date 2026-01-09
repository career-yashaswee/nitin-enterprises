'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentInService } from '../services/payment-in.service';
import type { CreatePaymentInInput, UpdatePaymentInInput } from '../types';

export function usePaymentIn() {
  return useQuery({
    queryKey: ['payment-in'],
    queryFn: () => paymentInService.getAll(),
  });
}

export function usePaymentInRecord(id: string) {
  return useQuery({
    queryKey: ['payment-in', id],
    queryFn: () => paymentInService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePaymentIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentInInput) => paymentInService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-in'] });
    },
  });
}

export function useUpdatePaymentIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePaymentInInput) => paymentInService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment-in'] });
      queryClient.invalidateQueries({ queryKey: ['payment-in', variables.id] });
    },
  });
}

export function useDeletePaymentIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentInService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-in'] });
    },
  });
}

export function usePaymentInByGoodsOutReceiptId(goodsOutReceiptId: string) {
  return useQuery({
    queryKey: ['payment-in', 'by-goods-out-receipt', goodsOutReceiptId],
    queryFn: () => paymentInService.getByGoodsOutReceiptId(goodsOutReceiptId),
    enabled: !!goodsOutReceiptId,
  });
}
