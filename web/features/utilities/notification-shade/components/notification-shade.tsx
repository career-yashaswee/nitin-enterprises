"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  ArrowsClockwise,
  Bell,
  CaretDown,
  CaretUp,
  Check,
  Medal,
  Gear,
  User,
  MusicNote,
  X,
  CheckCircle,
  XCircle,
  WarningCircle,
  Brain,
  Flask,
  Sparkle,
  Crown,
} from "@phosphor-icons/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { NotificationShadeProps, Notification } from "../types";

const getNotificationIcon = (notification: Notification) => {
  const content = `${notification.title} ${notification.message}`.toLowerCase();

  // Badge notifications
  const looksLikeBadge =
    (notification.metadata && "badgeEarned" in notification.metadata) ||
    /badge/i.test(content);
  if (looksLikeBadge) {
    return <Medal className="h-4 w-4 text-yellow-500" />;
  }

  // Compose Plus required
  if (
    /compose.*plus.*required|upgrade.*required|comprehensive.*analysis.*available/i.test(
      content,
    )
  ) {
    return <Crown className="h-4 w-4 text-yellow-500" weight="fill" />;
  }

  // Analysis in progress
  if (
    /analysis.*in.*progress|analysis.*compiling|being.*compiled/i.test(content)
  ) {
    return <Brain className="h-4 w-4 text-blue-500" />;
  }

  // Commit feedback available
  if (/commit.*feedback.*available|your.*commit.*feedback/i.test(content)) {
    return <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />;
  }

  // Test cases available for review
  if (
    /test.*cases.*available.*review|ai.*analysis.*could.*not/i.test(content)
  ) {
    return <Flask className="h-4 w-4 text-blue-500" />;
  }

  // AI analysis available but tests failed
  if (
    /ai.*analysis.*available.*tests.*need|tests.*need.*review/i.test(content)
  ) {
    return <WarningCircle className="h-4 w-4 text-orange-500" weight="fill" />;
  }

  // Analysis unavailable
  if (/analysis.*unavailable|both.*failed|unfortunately.*both/i.test(content)) {
    return <XCircle className="h-4 w-4 text-red-500" weight="fill" />;
  }

  // AI Analysis unavailable/failed
  if (
    /ai.*unavailable|ai.*failed|analysis.*unavailable|analysis.*failed/i.test(
      content,
    )
  ) {
    return <WarningCircle className="h-4 w-4 text-orange-500" weight="fill" />;
  }

  // AI Analysis success or available
  if (
    /ai.*available|ai.*complete|analysis.*complete|analysis.*ready/i.test(
      content,
    )
  ) {
    return <Brain className="h-4 w-4 text-purple-500" />;
  }

  // Test execution completed/results available
  if (
    /test.*results.*available|test.*complete|execution.*complete/i.test(content)
  ) {
    return <Flask className="h-4 w-4 text-blue-500" />;
  }

  // Test passed
  if (
    /test.*passed|all.*passed|success/i.test(content) &&
    /test/i.test(content)
  ) {
    return <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />;
  }

  // Test failed
  if (/test.*failed|tests.*failed|failed.*test/i.test(content)) {
    return <XCircle className="h-4 w-4 text-red-500" weight="fill" />;
  }

  // Commit related
  if (/commit|judge.*saw/i.test(content)) {
    return <Sparkle className="h-4 w-4 text-indigo-500" />;
  }

  // Category-based fallback
  switch (notification.category) {
    case "system":
      return <Gear className="h-4 w-4 text-blue-500" />;
    case "user":
      return <User className="h-4 w-4 text-purple-500" />;
    case "composition":
      return <MusicNote className="h-4 w-4 text-green-600" />;
    default:
      break;
  }

  // Type-based fallback
  switch (notification.type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />;
    case "warning":
      return (
        <WarningCircle className="h-4 w-4 text-orange-500" weight="fill" />
      );
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" weight="fill" />;
    default:
      return <Bell className="h-4 w-4 text-blue-500" />;
  }
};

const getNotificationBgColor = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30";
    case "warning":
      return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30";
    case "error":
      return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30";
    default:
      return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30";
  }
};

export function NotificationShade({
  notifications,
  unreadCount: propUnreadCount,
  onMarkAllAsRead,
  onNotificationClick,
  onNotificationDismiss,
  onRefresh,
  onViewAll,
  className,
  isMobile: propIsMobile,
  emptyMessage = "No notifications",
  viewAllLabel = "View all notifications",
}: NotificationShadeProps) {
  const isMobileQuery = useMediaQuery("(max-width: 1023px)");
  const isMobile = propIsMobile ?? isMobileQuery ?? false;

  const unreadCount =
    propUnreadCount ?? notifications.filter((n) => !n.isRead).length;

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "system">(
    "unread",
  );
  const [expandedNotifications, setExpandedNotifications] = useState<
    Set<string>
  >(new Set());

  // Deduplicate notifications by ID
  const uniqueNotifications = notifications.filter(
    (notification, index, self) =>
      index === self.findIndex((n) => n.id === notification.id),
  );

  const allCount = uniqueNotifications.length;
  const systemCount = uniqueNotifications.filter(
    (n) => n.category === "system",
  ).length;

  const filteredNotifications = uniqueNotifications.filter((notification) => {
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "system") return notification.category === "system";
    return true;
  });

  const handleToggleExpanded = (notificationId: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  const handleNotificationDismiss = (notificationId: string) => {
    onNotificationDismiss?.(notificationId);
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;

    try {
      const loadingToastId = toast.loading("Refreshing Notifications", {
        duration: Infinity,
      });

      const result = await onRefresh();

      toast.dismiss(loadingToastId);

      if (result && result.newCount > 0) {
        toast.success(
          `Notifications Refreshed Successfully! Found ${result.newCount} new notification${result.newCount === 1 ? "" : "s"}.`,
          {
            duration: 3000,
          },
        );
      } else {
        toast.success("No New Notification Found!", {
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error("Failed to refresh notifications", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        duration: 5000,
      });
    }
  };

  const ShadePanel = (
    <div className="bg-background border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Notifications Shade</h3>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
            >
              <ArrowsClockwise className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("unread")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
            activeTab === "unread"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Unread
          {unreadCount > 0 && (
            <Badge className="ml-2 h-5 px-1.5 text-xs bg-red-500 text-white border-red-500">
              {unreadCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
            activeTab === "all"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          All
          {allCount > 0 && (
            <Badge className="ml-2 h-5 px-1.5 text-xs bg-gray-500 text-white border-gray-500">
              {allCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
            activeTab === "system"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          System
          {systemCount > 0 && (
            <Badge className="ml-2 h-5 px-1.5 text-xs bg-gray-500 text-white border-gray-500">
              {systemCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "border-b last:border-b-0 transition-colors",
                !notification.isRead && "bg-muted/30 dark:bg-muted/10",
              )}
            >
              <div
                className={cn(
                  "p-4 transition-all",
                  getNotificationBgColor(notification.type),
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="shrink-0 mt-0.5 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {getNotificationIcon(notification)}
                  </div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {(() => {
                            try {
                              const date = new Date(notification.timestamp);
                              if (isNaN(date.getTime())) {
                                return notification.timestamp;
                              }
                              return formatDistanceToNow(date, {
                                addSuffix: true,
                              });
                            } catch {
                              return notification.timestamp;
                            }
                          })()}
                        </span>
                        {onNotificationDismiss && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationDismiss(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {notification.message && (
                      <div className="mt-1">
                        <p
                          className={cn(
                            "text-sm text-muted-foreground",
                            !expandedNotifications.has(notification.id) &&
                              "line-clamp-2",
                          )}
                        >
                          {notification.message}
                        </p>
                      </div>
                    )}
                  </div>
                  {notification.message && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExpanded(notification.id);
                      }}
                    >
                      {expandedNotifications.has(notification.id) ? (
                        <CaretUp className="h-3 w-3" />
                      ) : (
                        <CaretDown className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/30 dark:bg-muted/10">
        {activeTab === "unread" && unreadCount > 0 && onMarkAllAsRead && (
          <Button
            variant="link"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="h-auto p-0 text-sm"
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        )}
        {(activeTab !== "unread" || unreadCount === 0) && <div />}

        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll}>
            {viewAllLabel}
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-red-500">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[min(24rem,92vw)] p-0 bg-transparent border-none shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">Notifications</DialogTitle>
          {ShadePanel}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <Badge
              className={cn(
                "p-0 flex items-center justify-center text-xs bg-red-500 text-white border-red-500",
                unreadCount > 9
                  ? "h-5 px-2 rounded-full absolute -top-3 -right-3"
                  : "h-5 w-5 rounded-full absolute -top-2 -right-2",
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
        {ShadePanel}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
