import type { ReactNode, ComponentProps } from "react";
import type { UseStatefulButtonOptions } from "./hooks/use-stateful-button";

export type StatefulButtonProps = UseStatefulButtonOptions & {
  children: ReactNode;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  doubleTapToConfirm?: boolean;
  doubleTapTimeoutMs?: number;
  doubleTapConfirmMessage?: string;
} & Omit<ComponentProps<"button">, "onClick" | "disabled" | "type" | "children" | "className" | "onError">;
