import type { VariantProps } from "class-variance-authority";
import type { QueryKey } from "@tanstack/react-query";
import type { buttonVariants } from "@/components/ui/button";

export interface RefreshButtonProps extends VariantProps<
  typeof buttonVariants
> {
  queryKeys: QueryKey[];
  resource?: string;
  label?: string;
  ariaLabel?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  showIcon?: boolean;
}
