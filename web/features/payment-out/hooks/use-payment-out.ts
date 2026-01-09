'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentOutService } from '../services/payment-out.service';
import type { CreatePaymentOutInput, UpdatePaymentOutInput } from '../types';

export function usePaymentOut() {
  return useQuery({
    queryKey: ['payment-out'],
    queryFn: () => paymentOutService.getAll(),
  });
}

export function usePaymentOutRecord(id: string) {
  return useQuery({
    queryKey: ['payment-out', id],
    queryFn: () => paymentOutService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePaymentOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentOutInput) => paymentOutService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-out'] });
    },
  });
}

export function useUpdatePaymentOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePaymentOutInput) => paymentOutService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment-out'] });
      queryClient.invalidateQueries({ queryKey: ['payment-out', variables.id] });
    },
  });
}

export function useDeletePaymentOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentOutService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-out'] });
    },
  });
}

export function usePaymentOutByGoodsInReceiptId(goodsInReceiptId: string) {
  return useQuery({
    queryKey: ['payment-out', 'by-goods-in-receipt', goodsInReceiptId],
    queryFn: () => paymentOutService.getByGoodsInReceiptId(goodsInReceiptId),
    enabled: !!goodsInReceiptId,
  });
}
