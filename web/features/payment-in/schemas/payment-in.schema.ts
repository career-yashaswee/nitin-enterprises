import { z } from "zod";

export const createPaymentInSchema = (
  getRemainingAmount: (receiptId: string) => number | null
) =>
  z
    .object({
      goods_out_receipt_id: z.string().min(1, "Goods Out Receipt is required"),
      account_id: z.string().min(1, "Account is required"),
      amount: z
        .number("Amount must be a number")
        .positive("Amount must be greater than 0")
        .min(0.01, "Amount must be at least 0.01"),
      date: z.string().min(1, "Date is required"),
      payment_mode: z
        .string()
        .min(1, "Payment mode is required")
        .refine(
          (val) => ["Cash", "UPI", "Bank Transfer", "Cheque", "Card"].includes(val),
          "Invalid payment mode"
        ),
      notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const remaining = getRemainingAmount(data.goods_out_receipt_id);
      if (remaining !== null && data.amount > remaining) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Amount cannot exceed remaining amount of ₹${remaining.toFixed(2)}`,
          path: ["amount"],
        });
      }
    });

export type PaymentInFormData = z.infer<
  ReturnType<typeof createPaymentInSchema>
>;
