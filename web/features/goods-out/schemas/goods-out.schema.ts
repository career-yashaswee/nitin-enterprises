import { z } from "zod";

const createGoodsOutItemSchema = (
  getAvailableQuantity: (itemName: string) => number | null
) =>
  z
    .object({
      item_name: z.string().min(1, "Item name is required"),
      quantity: z
        .number("Quantity must be a number")
        .positive("Quantity must be greater than 0")
        .min(0.01, "Quantity must be at least 0.01"),
      unit: z.string().min(1, "Unit is required"),
      unit_price: z
        .number("Unit price must be a number")
        .nonnegative("Unit price must be 0 or greater")
        .min(0, "Unit price must be at least 0"),
      total: z.number().nonnegative("Total must be 0 or greater"),
    })
    .superRefine((data, ctx) => {
      const available = getAvailableQuantity(data.item_name);
      if (available !== null && data.quantity > available) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Quantity cannot exceed available inventory of ${available}`,
          path: ["quantity"],
        });
      }
    });

export const createGoodsOutSchema = (
  getAvailableQuantity: (itemName: string) => number | null
) =>
  z.object({
    account_id: z.string().min(1, "Account is required"),
    date: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
    items: z
      .array(createGoodsOutItemSchema(getAvailableQuantity))
      .min(1, "At least one item is required"),
  });

export type GoodsOutFormData = z.infer<
  ReturnType<typeof createGoodsOutSchema>
>;
