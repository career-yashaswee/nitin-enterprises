import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

export interface OptimisticActionButtonProps extends VariantProps<
  typeof buttonVariants
> {
  action: () => Promise<void>;
  optimisticState: boolean;
  onOptimisticUpdate: () => void;
  onRollback: () => void;
  children: ReactNode;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
  doubleTapToConfirm?: boolean;
  doubleTapTimeoutMs?: number;
  doubleTapConfirmMessage?: string;
}
