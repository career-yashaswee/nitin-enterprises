"use client";

import { Button } from "@/components/ui/button";
import { Spinner, CheckCircle, XCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStatefulButton } from "../hooks/use-stateful-button";
import type { StatefulButtonProps } from "../types";

export function StatefulButton({
  children,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  type = "button",
  doubleTapToConfirm = false,
  doubleTapTimeoutMs = 3000,
  doubleTapConfirmMessage = "Press again to confirm",
  onAction,
  onSuccess,
  onError,
  rateLimitMs,
  ...buttonProps
}: StatefulButtonProps) {
  const {
    state,
    handleClick,
    isLoading,
    isSuccess,
    isError,
    isWaitingForConfirm,
  } = useStatefulButton({
    onAction,
    onSuccess,
    onError,
    rateLimitMs,
    doubleTapToConfirm,
    doubleTapTimeoutMs,
    doubleTapConfirmMessage,
  });

  const getButtonVariant = () => {
    if (isSuccess) return "default";
    if (isError) return "destructive";
    return variant;
  };

  return (
    <Button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant={getButtonVariant()}
      size={size}
      className={cn("relative overflow-hidden", className)}
      {...buttonProps}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2"
          >
            <Spinner className="h-4 w-4 animate-spin" />
            <span>Loading</span>
          </motion.div>
        )}
        {isSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Success</span>
          </motion.div>
        )}
        {isError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            <span>Error</span>
          </motion.div>
        )}
        {isWaitingForConfirm && (
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
        )}
        {state === "default" && !isWaitingForConfirm && (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
