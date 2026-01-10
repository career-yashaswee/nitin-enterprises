"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OptimisticActionButtonProps } from "../types";
import { useOptimisticActionButton } from "../hooks/use-optimistic-action-button";
import { Spinner } from "@phosphor-icons/react";

export function OptimisticActionButton({
  action,
  optimisticState,
  onOptimisticUpdate,
  onRollback,
  children,
  loadingMessage = "Processing",
  successMessage = "Action completed successfully.",
  errorMessage = "Action failed. Please try again.",
  onSuccess,
  onError,
  variant,
  size,
  className,
  disabled = false,
  doubleTapToConfirm = false,
  doubleTapTimeoutMs = 3000,
  doubleTapConfirmMessage = "Press again to confirm",
}: OptimisticActionButtonProps) {
  const { isLoading, isWaitingForConfirm, handleClick } =
    useOptimisticActionButton({
      action,
      optimisticState,
      onOptimisticUpdate,
      onRollback,
      loadingMessage,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      doubleTapToConfirm,
      doubleTapTimeoutMs,
      doubleTapConfirmMessage,
    });

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => {
        if (!disabled) {
          handleClick();
        }
      }}
      disabled={isLoading || disabled}
      className={cn("relative overflow-hidden", className)}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Spinner className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">{loadingMessage}</span>
          </motion.div>
        ) : isWaitingForConfirm ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <span>{doubleTapConfirmMessage}</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
