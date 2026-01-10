export interface NotificationAction {
  label: string;
  variant: "default" | "outline" | "destructive";
  onClick: () => void;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: "system" | "user" | "composition" | string;
  metadata?: Record<string, unknown>;
  isExpanded?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationShadeProps {
  notifications: Notification[];
  unreadCount?: number;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onRefresh?: () => Promise<{ newCount: number }> | void;
  onViewAll?: () => void;
  className?: string;
  isMobile?: boolean;
  emptyMessage?: string;
  viewAllLabel?: string;
}
