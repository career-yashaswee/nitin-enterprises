"use client";

import { useThrottledCallback as useThrottledCallbackPacer } from "@tanstack/react-pacer";

/**
 * Hook to throttle a callback function
 * @param callback - The function to throttle
 * @param delay - Delay in milliseconds (default: 1000)
 * @returns The throttled callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
): T {
  return useThrottledCallbackPacer(callback, { wait: delay }) as T;
}
