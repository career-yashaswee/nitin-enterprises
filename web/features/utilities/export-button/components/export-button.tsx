"use client";

import { Download, Check } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExportButtonProps } from "../types";
import { useExportButton } from "../hooks/use-export-button";

export function ExportButton({
  fetchData,
  filename = "export",
  resource = "data",
  label,
  onSuccess,
  onError,
  variant = "outline",
  size = "sm",
  className,
  showIcon = true,
  format = "csv",
}: ExportButtonProps) {
  const { isExporting, hasExported, handleExport } = useExportButton({
    fetchData,
    filename,
    resource,
    format,
    onSuccess,
    onError,
  });

  const isIconSize =
    size === "icon" || size === "icon-sm" || size === "icon-lg";
  const shouldShowIcon = isIconSize ? true : showIcon;
  const shouldShowLabel = isIconSize
    ? false
    : (label ?? `Export ${format.toUpperCase()}`);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <AnimatePresence mode="wait">
        {hasExported && !isExporting ? (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="h-4 w-4 shrink-0" />
          </motion.div>
        ) : shouldShowIcon ? (
          <motion.div
            key="download"
            animate={{ y: isExporting ? [0, -2, 0] : 0 }}
            transition={{ duration: 0.6, repeat: isExporting ? Infinity : 0 }}
          >
            <Download className="h-4 w-4 shrink-0" />
          </motion.div>
        ) : null}
      </AnimatePresence>
      {shouldShowLabel && (
        <span className="hidden sm:inline">{shouldShowLabel}</span>
      )}
    </Button>
  );
}
