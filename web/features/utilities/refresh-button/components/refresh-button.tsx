"use client";

import { useCallback, useState } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { type VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps extends VariantProps<typeof buttonVariants> {
  queryKeys: QueryKey[];
  resource?: string;
  label?: string;
  ariaLabel?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  showIcon?: boolean;
}

export function RefreshButton({
  queryKeys,
  resource = "data",
  label,
  ariaLabel,
  onSuccess,
  onError,
  variant = "outline",
  size = "sm",
  className,
  showIcon = true,
}: RefreshButtonProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = useCallback(() => {
    if (!queryKeys.length || isRefreshing) return;

    setIsRefreshing(true);

    const refreshPromise = Promise.allSettled(
      queryKeys.map((key) =>
        queryClient.invalidateQueries({ queryKey: key }).catch((error) => {
          const err =
            error instanceof Error ? error : new Error("Refresh failed");
          onError?.(err);
          return Promise.reject(err);
        }),
      ),
    ).then((results) => {
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length === 0) {
        onSuccess?.();
      } else if (failures.length < results.length) {
        // Partial success - decide how to handle
        onSuccess?.(); // or handle differently
      }
      if (failures.length > 0) {
        throw new Error(
          `Failed to refresh ${failures.length} of ${results.length} queries`,
        );
      }
    });

    toast.promise(refreshPromise, {
      loading: `Refreshing ${resource}`,
      success: `${resource} refreshed successfully!`,
      error: `Failed to refresh ${resource}.`,
    });

    refreshPromise.finally(() => {
      setIsRefreshing(false);
    });
  }, [queryClient, queryKeys, resource, isRefreshing, onSuccess, onError]);

  const isIconSize =
    size === "icon" || size === "icon-sm" || size === "icon-lg";
  const shouldShowIcon = isIconSize ? true : showIcon;
  const shouldShowLabel = isIconSize ? false : (label ?? "Refresh");
  const displayAriaLabel = ariaLabel ?? `Refresh ${resource}`;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={displayAriaLabel}
      onClick={handleClick}
      disabled={isRefreshing}
      className={cn("inline-flex items-center gap-2", className)}
    >
      {shouldShowIcon && (
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{
            duration: 1,
            repeat: isRefreshing ? Infinity : 0,
            ease: "linear",
          }}
        >
          <ArrowsClockwise className="h-4 w-4 shrink-0" />
        </motion.div>
      )}
      {shouldShowLabel && (
        <span className="hidden sm:inline">{shouldShowLabel}</span>
      )}
    </Button>
  );
}
