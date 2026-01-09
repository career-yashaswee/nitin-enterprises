"use client";

import { useState } from "react";
import { usePaymentInByGoodsOutReceiptId } from "@/features/payment-in/hooks/use-payment-in";
import { GoodsOutReceipt } from "./goods-out-receipt";
import { generatePDFFromElement } from "@/lib/utils/pdf-generator";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { GoodsOutReceiptWithItems } from "../types";

interface GoodsOutPrintProps {
  receipt: GoodsOutReceiptWithItems;
}

export function GoodsOutPrint({ receipt }: GoodsOutPrintProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: payments = [] } = usePaymentInByGoodsOutReceiptId(receipt.id);

  const handlePrint = async () => {
    try {
      setIsGenerating(true);
      
      // Wait a bit for the receipt to render
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const receiptElementId = `goods-out-receipt-${receipt.id}`;
      const filename = `Goods-Out-Receipt-${receipt.id}-${new Date().toISOString().split("T")[0]}.pdf`;
      await generatePDFFromElement(receiptElementId, filename);
      
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      const message = error instanceof Error ? error.message : "Failed to generate PDF";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Hidden receipt for PDF generation */}
      <div className="fixed -left-[9999px] top-0">
        <GoodsOutReceipt receipt={receipt} payments={payments} receiptId={`goods-out-receipt-${receipt.id}`} />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrint}
        disabled={isGenerating}
        title="Print Receipt"
      >
        <PrinterIcon className="size-4" />
      </Button>
    </>
  );
}
