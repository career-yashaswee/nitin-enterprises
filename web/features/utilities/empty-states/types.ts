import type { ReactNode } from "react";

export type EmptyStateType =
  | "no-data"
  | "error"
  | "loading"
  | "not-found"
  | "search"
  | "not-authorized"
  | "not-authenticated"
  | "not-sufficient-data";

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
