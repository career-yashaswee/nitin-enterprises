import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

export interface ExportButtonProps extends VariantProps<typeof buttonVariants> {
  fetchData: () => Promise<unknown[]>;
  filename?: string;
  resource?: string;
  label?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  showIcon?: boolean;
  format?: "csv" | "json";
}
