"use client";

import { format } from "date-fns";
import type { GoodsOutReceiptWithItems } from "../types";
import type { PaymentInWithRelations } from "@/features/payment-in/types";

interface GoodsOutReceiptProps {
  receipt: GoodsOutReceiptWithItems;
  payments: PaymentInWithRelations[];
  receiptId?: string;
}

export function GoodsOutReceipt({ receipt, payments, receiptId }: GoodsOutReceiptProps) {
  const totalAmount = receipt.total_amount;
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = totalAmount - totalPaid;
  const id = receiptId || `goods-out-receipt-${receipt.id}`;

  return (
    <div
      id={id}
      className="p-8 max-w-4xl mx-auto"
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      {/* Header */}
      <div
        className="mb-8 text-center pb-4"
        style={{ borderBottom: "2px solid #1f2937" }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#000000" }}>
          GOODS OUT RECEIPT
        </h1>
        <p className="text-lg" style={{ color: "#4b5563" }}>
          Nitin Enterprises
        </p>
      </div>

      {/* Receipt Details */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between">
          <div>
            <p className="text-sm" style={{ color: "#4b5563" }}>
              Account Name:
            </p>
            <p className="text-lg font-semibold" style={{ color: "#000000" }}>
              {receipt.account?.name || "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: "#4b5563" }}>
              Date:
            </p>
            <p className="text-lg font-semibold" style={{ color: "#000000" }}>
              {format(new Date(receipt.date), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
        {receipt.notes && (
          <div className="mt-4">
            <p className="text-sm" style={{ color: "#4b5563" }}>
              Notes:
            </p>
            <p className="text-sm" style={{ color: "#000000" }}>
              {receipt.notes}
            </p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table
          className="w-full border-collapse"
          style={{ border: "1px solid #1f2937" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th
                className="px-4 py-3 text-left font-semibold"
                style={{ border: "1px solid #1f2937", color: "#000000" }}
              >
                Item Name
              </th>
              <th
                className="px-4 py-3 text-right font-semibold"
                style={{ border: "1px solid #1f2937", color: "#000000" }}
              >
                Quantity
              </th>
              <th
                className="px-4 py-3 text-right font-semibold"
                style={{ border: "1px solid #1f2937", color: "#000000" }}
              >
                Unit Price
              </th>
              <th
                className="px-4 py-3 text-right font-semibold"
                style={{ border: "1px solid #1f2937", color: "#000000" }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={item.id || index}>
                <td
                  className="px-4 py-3"
                  style={{ border: "1px solid #1f2937", color: "#000000" }}
                >
                  {item.item_name}
                </td>
                <td
                  className="px-4 py-3 text-right"
                  style={{ border: "1px solid #1f2937", color: "#000000" }}
                >
                  {item.quantity}
                </td>
                <td
                  className="px-4 py-3 text-right"
                  style={{ border: "1px solid #1f2937", color: "#000000" }}
                >
                  ₹{item.unit_price.toFixed(2)}
                </td>
                <td
                  className="px-4 py-3 text-right font-medium"
                  style={{ border: "1px solid #1f2937", color: "#000000" }}
                >
                  ₹{item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Amount */}
      <div className="mb-6 text-right">
        <div
          className="inline-block px-6 py-3"
          style={{ border: "2px solid #1f2937" }}
        >
          <p className="text-xl font-bold" style={{ color: "#000000" }}>
            Total Amount: ₹{totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payment Details */}
      {payments.length > 0 && (
        <div className="mb-6">
          <h2
            className="text-xl font-bold mb-4 pb-2"
            style={{
              borderBottom: "1px solid #9ca3af",
              color: "#000000",
            }}
          >
            Payment Details
          </h2>
          <table
            className="w-full border-collapse"
            style={{ border: "1px solid #1f2937" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ border: "1px solid #1f2937", color: "#000000" }}
                >
                  Date
                </th>
                <th
                  className="px-4 py-3 text-right font-semibold"
                  style={{ border: "1px solid #1f2937", color: "#000000" }}
                >
                  Amount Received
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ border: "1px solid #1f2937", color: "#000000" }}
                >
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id || index}>
                  <td
                    className="px-4 py-3"
                    style={{ border: "1px solid #1f2937", color: "#000000" }}
                  >
                    {format(new Date(payment.date), "MMM dd, yyyy")}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-medium"
                    style={{ border: "1px solid #1f2937", color: "#000000" }}
                  >
                    ₹{payment.amount.toFixed(2)}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ border: "1px solid #1f2937", color: "#000000" }}
                  >
                    {payment.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div
        className="mt-6 pt-4"
        style={{ borderTop: "2px solid #1f2937" }}
      >
        <div className="flex justify-end space-x-8 text-lg">
          <div className="text-right">
            <p style={{ color: "#4b5563" }}>Total Amount:</p>
            <p style={{ color: "#4b5563" }}>Total Received:</p>
            <p className="font-bold text-xl mt-2" style={{ color: "#000000" }}>
              Remaining Amount:
            </p>
          </div>
          <div className="text-right min-w-[150px]">
            <p className="font-semibold" style={{ color: "#000000" }}>
              ₹{totalAmount.toFixed(2)}
            </p>
            <p className="font-semibold" style={{ color: "#000000" }}>
              ₹{totalPaid.toFixed(2)}
            </p>
            <p className="font-bold text-xl mt-2" style={{ color: "#dc2626" }}>
              ₹{remainingAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
