"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goodsOutService } from "../services/goods-out.service";
import type {
  CreateGoodsOutReceiptInput,
  UpdateGoodsOutReceiptInput,
} from "../types";

export function useGoodsOut() {
  return useQuery({
    queryKey: ["goods-out"],
    queryFn: () => goodsOutService.getAll(),
  });
}

export function useGoodsOutReceipt(id: string) {
  return useQuery({
    queryKey: ["goods-out", id],
    queryFn: () => goodsOutService.getById(id),
    enabled: !!id,
  });
}

export function useCreateGoodsOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGoodsOutReceiptInput) =>
      goodsOutService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods-out"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUpdateGoodsOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateGoodsOutReceiptInput) =>
      goodsOutService.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goods-out"] });
      queryClient.invalidateQueries({ queryKey: ["goods-out", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useDeleteGoodsOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsOutService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods-out"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
