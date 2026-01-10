import type { ComponentType } from "react";

export interface ShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  withUtmParams?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export interface ShareOption {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  action: () => void;
  color?: string;
}
