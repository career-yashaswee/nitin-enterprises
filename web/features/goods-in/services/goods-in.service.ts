import { supabase } from "@/lib/supabase/client";
import type {
  GoodsInReceipt,
  GoodsInItem,
  GoodsInReceiptWithItems,
  CreateGoodsInReceiptInput,
  UpdateGoodsInReceiptInput,
} from "../types";

export const goodsInService = {
  async getAll(): Promise<GoodsInReceiptWithItems[]> {
    const { data: receipts, error } = await supabase
      .from("goods_in_receipts")
      .select(
        `
        *,
        account:accounts(id, name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const receiptsWithItems = await Promise.all(
      (receipts || []).map(async (receipt) => {
        const { data: items } = await supabase
          .from("goods_in_items")
          .select("*")
          .eq("receipt_id", receipt.id)
          .order("created_at");

        return {
          ...receipt,
          items: items || [],
        };
      })
    );

    return receiptsWithItems;
  },

  async getById(id: string): Promise<GoodsInReceiptWithItems | null> {
    const { data: receipt, error } = await supabase
      .from("goods_in_receipts")
      .select(
        `
        *,
        account:accounts(id, name)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!receipt) return null;

    const { data: items } = await supabase
      .from("goods_in_items")
      .select("*")
      .eq("receipt_id", id)
      .order("created_at");

    return {
      ...receipt,
      items: items || [],
    };
  },

  async create(
    input: CreateGoodsInReceiptInput
  ): Promise<GoodsInReceiptWithItems> {
    // Create receipt
    const { data: receipt, error: receiptError } = await supabase
      .from("goods_in_receipts")
      .insert({
        account_id: input.account_id,
        date: input.date,
        notes: input.notes,
      })
      .select()
      .single();

    if (receiptError) throw receiptError;
    if (!receipt) throw new Error("Failed to create receipt");

    // Create items
    if (input.items.length > 0) {
      const itemsToInsert = input.items.map((item) => ({
        receipt_id: receipt.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit || "Kg",
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from("goods_in_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    // Fetch complete receipt with items
    return this.getById(receipt.id) as Promise<GoodsInReceiptWithItems>;
  },

  async update(
    input: UpdateGoodsInReceiptInput
  ): Promise<GoodsInReceiptWithItems> {
    const { id, items, ...updateData } = input;

    // Update receipt
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("goods_in_receipts")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    }

    // Update items if provided
    if (items !== undefined) {
      // Delete existing items
      await supabase.from("goods_in_items").delete().eq("receipt_id", id);

      // Insert new items
      if (items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          receipt_id: id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit || "Kg",
          unit_price: item.unit_price,
          total: item.total,
        }));

        const { error } = await supabase
          .from("goods_in_items")
          .insert(itemsToInsert);
        if (error) throw error;
      }
    }

    return this.getById(id) as Promise<GoodsInReceiptWithItems>;
  },

  async delete(id: string): Promise<void> {
    // Items will be deleted via CASCADE
    const { error } = await supabase
      .from("goods_in_receipts")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
