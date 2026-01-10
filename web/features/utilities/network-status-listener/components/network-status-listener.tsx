"use client";

import { useEffect, useRef } from "react";
import { useNetworkState, useIsFirstRender } from "@uidotdev/usehooks";
import { toast } from "sonner";
import type { NetworkStatusListenerProps } from "../types";

/**
 * Monitors network connectivity and shows toast notifications on status changes.
 */
export function NetworkStatusListener({
  offlineMessage = "You are offline. Please check your connection.",
  onlineMessage = "Connection restored. You are back online.",
  showToast = true,
}: NetworkStatusListenerProps) {
  const network = useNetworkState();
  const wasOffline = useRef(false);
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (isFirstRender) {
      wasOffline.current = network.online === false;
      return;
    }

    if (!network.online && !wasOffline.current) {
      wasOffline.current = true;
      if (showToast) {
        toast.error(offlineMessage, { duration: 5000 });
      }
    } else if (network.online && wasOffline.current) {
      wasOffline.current = false;
      if (showToast) {
        toast.success(onlineMessage, { duration: 3000 });
      }
    }
  }, [network.online, showToast, offlineMessage, onlineMessage, isFirstRender]);

  return null;
}
