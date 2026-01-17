"use client";

import { format } from "date-fns";
import type { GoodsOutReceiptWithItems } from "../types";
import type { PaymentInWithRelations } from "@/features/payment-in/types";
import { amountToWords } from "@/lib/utils/amount-to-words";

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
        className="mb-8 text-center pb-6"
        style={{ 
          borderBottom: "3px solid #1f2937",
          background: "linear-gradient(to right, #f9fafb, #ffffff, #f9fafb)"
        }}
      >
        <h1 className="text-4xl font-bold mb-3" style={{ color: "#000000", letterSpacing: "1px" }}>
          GOODS OUT RECEIPT
        </h1>
        <p className="text-xl font-semibold mb-4" style={{ color: "#1f2937" }}>
          Nitin Enterprises
        </p>
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
            Receipt ID: <span style={{ color: "#000000", fontFamily: "monospace" }}>{receipt.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* Receipt Details */}
      <div className="mb-8 space-y-4 p-4 rounded-lg" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "#6b7280", textTransform: "uppercase" }}>
              Account Name
            </p>
            <p className="text-lg font-bold" style={{ color: "#000000" }}>
              {receipt.account?.name || "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium mb-1" style={{ color: "#6b7280", textTransform: "uppercase" }}>
              Date
            </p>
            <p className="text-lg font-bold" style={{ color: "#000000" }}>
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
            <tr style={{ backgroundColor: "#1f2937" }}>
              <th
                className="px-4 py-3 text-left font-semibold"
                style={{ border: "1px solid #374151", color: "#ffffff" }}
              >
                Item Name
              </th>
              <th
                className="px-4 py-3 text-right font-semibold"
                style={{ border: "1px solid #374151", color: "#ffffff" }}
              >
                Quantity
              </th>
              <th
                className="px-4 py-3 text-center font-semibold"
                style={{ border: "1px solid #374151", color: "#ffffff" }}
              >
                Unit
              </th>
              <th
                className="px-4 py-3 text-right font-semibold"
                style={{ border: "1px solid #374151", color: "#ffffff" }}
              >
                Unit Price
              </th>
              <th
                className="px-4 py-3 text-right font-semibold"
                style={{ border: "1px solid #374151", color: "#ffffff" }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={item.id || index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                <td
                  className="px-4 py-3 font-medium"
                  style={{ border: "1px solid #e5e7eb", color: "#000000" }}
                >
                  {item.item_name}
                </td>
                <td
                  className="px-4 py-3 text-right"
                  style={{ border: "1px solid #e5e7eb", color: "#000000" }}
                >
                  {item.quantity}
                </td>
                <td
                  className="px-4 py-3 text-center"
                  style={{ border: "1px solid #e5e7eb", color: "#6b7280" }}
                >
                  {item.unit || "Kg"}
                </td>
                <td
                  className="px-4 py-3 text-right"
                  style={{ border: "1px solid #e5e7eb", color: "#000000" }}
                >
                  ₹{item.unit_price.toFixed(2)}
                </td>
                <td
                  className="px-4 py-3 text-right font-semibold"
                  style={{ border: "1px solid #e5e7eb", color: "#000000" }}
                >
                  ₹{item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Amount */}
      <div className="mb-8 text-right">
        <div
          className="inline-block px-8 py-4 rounded-lg"
          style={{ 
            backgroundColor: "#1f2937",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}
        >
          <p className="text-2xl font-bold" style={{ color: "#ffffff" }}>
            Total Amount: ₹{totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="mt-4 text-right">
          <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
            Amount in Words:
          </p>
          <p className="text-base font-semibold mt-1" style={{ color: "#000000" }}>
            {amountToWords(totalAmount)}
          </p>
        </div>
      </div>

      {/* Payment Details */}
      {payments.length > 0 && (
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-4 pb-3"
            style={{
              borderBottom: "2px solid #1f2937",
              color: "#000000",
            }}
          >
            Payment Details
          </h2>
          <table
            className="w-full border-collapse rounded-lg overflow-hidden"
            style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1f2937" }}>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ border: "1px solid #374151", color: "#ffffff" }}
                >
                  Date
                </th>
                <th
                  className="px-4 py-3 text-right font-semibold"
                  style={{ border: "1px solid #374151", color: "#ffffff" }}
                >
                  Amount Received
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold"
                  style={{ border: "1px solid #374151", color: "#ffffff" }}
                >
                  Payment Mode
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ border: "1px solid #374151", color: "#ffffff" }}
                >
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id || index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                  <td
                    className="px-4 py-3"
                    style={{ border: "1px solid #e5e7eb", color: "#000000" }}
                  >
                    {format(new Date(payment.date), "MMM dd, yyyy")}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-semibold"
                    style={{ border: "1px solid #e5e7eb", color: "#000000" }}
                  >
                    ₹{payment.amount.toFixed(2)}
                  </td>
                  <td
                    className="px-4 py-3 text-center"
                    style={{ border: "1px solid #e5e7eb", color: "#6b7280" }}
                  >
                    {payment.payment_mode || "Cash"}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ border: "1px solid #e5e7eb", color: "#000000" }}
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
        className="mt-8 pt-6 rounded-lg p-6"
        style={{ 
          borderTop: "3px solid #1f2937",
          backgroundColor: "#f9fafb",
          border: "2px solid #e5e7eb"
        }}
      >
        <div className="flex justify-end space-x-12 text-lg">
          <div className="text-right space-y-2">
            <p className="font-medium" style={{ color: "#6b7280" }}>Total Amount:</p>
            <p className="font-medium" style={{ color: "#6b7280" }}>Total Received:</p>
            <p className="font-bold text-2xl mt-4 pt-2" style={{ color: "#000000", borderTop: "2px solid #d1d5db" }}>
              Remaining Amount:
            </p>
          </div>
          <div className="text-right min-w-[180px] space-y-2">
            <p className="font-bold text-lg" style={{ color: "#000000" }}>
              ₹{totalAmount.toFixed(2)}
            </p>
            <p className="font-bold text-lg" style={{ color: "#000000" }}>
              ₹{totalPaid.toFixed(2)}
            </p>
            <p className="font-bold text-2xl mt-4 pt-2" style={{ color: "#dc2626", borderTop: "2px solid #d1d5db" }}>
              ₹{remainingAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
