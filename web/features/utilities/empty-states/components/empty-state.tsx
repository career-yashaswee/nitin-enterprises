"use client";

import { isValidElement, type ComponentType } from "react";
import {
  Tray,
  WarningCircle,
  Spinner,
  Question,
  MagnifyingGlass,
  ShieldSlash,
  SignIn,
  Database,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EmptyStateProps, EmptyStateType } from "../types";

const defaultConfig: Record<
  EmptyStateType,
  {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    defaultActionLabel?: string;
  }
> = {
  "no-data": {
    icon: Tray,
    title: "No data available",
    description: "There's nothing to display here yet.",
    defaultActionLabel: "Refresh",
  },
  error: {
    icon: WarningCircle,
    title: "Something went wrong",
    description: "We encountered an error. Please try again.",
    defaultActionLabel: "Try again",
  },
  loading: {
    icon: Spinner,
    title: "Loading",
    description: "Please wait while we fetch the data.",
  },
  "not-found": {
    icon: Question,
    title: "Not found",
    description: "The item you're looking for doesn't exist.",
    defaultActionLabel: "Go back",
  },
  search: {
    icon: MagnifyingGlass,
    title: "No results found",
    description: "Try adjusting your search criteria.",
    defaultActionLabel: "Clear search",
  },
  "not-authorized": {
    icon: ShieldSlash,
    title: "Access denied",
    description: "You don't have permission to view this content.",
    defaultActionLabel: "Request access",
  },
  "not-authenticated": {
    icon: SignIn,
    title: "Authentication required",
    description: "Please sign in to access this content.",
    defaultActionLabel: "Sign in",
  },
  "not-sufficient-data": {
    icon: Database,
    title: "Insufficient data",
    description: "There isn't enough data to display this content.",
    defaultActionLabel: "Refresh",
  },
};

export function EmptyState({
  type = "no-data",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const config = defaultConfig[type];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const DefaultIcon = config.icon;
  const displayActionLabel =
    actionLabel || config.defaultActionLabel || undefined;
  const shouldShowButton = !!displayActionLabel;

  return (
    <div className="min-h-[400px] rounded-lg border border-dashed bg-muted/20">
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
      >
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            type === "error" && "bg-destructive/10 text-destructive",
            type === "loading" && "bg-primary/10 text-primary",
            type === "not-found" && "bg-muted text-muted-foreground",
            type === "search" && "bg-muted text-muted-foreground",
            type === "no-data" && "bg-muted text-muted-foreground",
            type === "not-authorized" && "bg-destructive/10 text-destructive",
            type === "not-authenticated" &&
              "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            type === "not-sufficient-data" && "bg-muted text-muted-foreground"
          )}
        >
          {icon ? (
            // Custom icon provided by user (ReactNode)
            isValidElement(icon) ? (
              icon
            ) : typeof icon === "function" ? (
              // Icon component passed as function (e.g., Lucide icon component)
              (() => {
                const IconComponent = icon as React.ComponentType<{
                  className?: string;
                }>;
                return (
                  <IconComponent
                    className={cn(
                      "h-8 w-8",
                      type === "loading" && "animate-spin"
                    )}
                  />
                );
              })()
            ) : (
              // Fallback for other types
              icon
            )
          ) : (
            // Default icon from @phosphor-icons/react - always rendered when no custom icon
            <DefaultIcon
              className={cn("h-8 w-8", type === "loading" && "animate-spin")}
            />
          )}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{displayTitle}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {displayDescription}
        </p>
        {shouldShowButton && displayActionLabel && (
          <Button
            type="button"
            variant="outline"
            onClick={onAction || (() => {})}
            disabled={!onAction}
          >
            {displayActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
