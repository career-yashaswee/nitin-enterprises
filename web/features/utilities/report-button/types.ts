export interface ReportIssue {
  id: string;
  label: string;
  description: string;
}

export interface ReportButtonProps {
  reportId: string;
  reportTitle: string;
  issues: ReportIssue[];
  onSubmit: (payload: ReportPayload) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export interface ReportPayload {
  issues: string[];
  customIssue?: string;
  description?: string;
  context?: {
    path?: string;
    url?: string;
  };
}
