import { useState, useCallback, useRef, useEffect } from "react";
import { useRateLimitedCallback } from "@tanstack/react-pacer";

export type ButtonState = "default" | "loading" | "success" | "error";

export interface UseStatefulButtonOptions {
  onAction: () => Promise<void> | void;
  rateLimitMs?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  doubleTapToConfirm?: boolean;
  doubleTapTimeoutMs?: number;
  doubleTapConfirmMessage?: string;
}

export function useStatefulButton({
  onAction,
  rateLimitMs = 1000,
  onSuccess,
  onError,
  doubleTapToConfirm = false,
  doubleTapTimeoutMs = 3000,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  doubleTapConfirmMessage: _doubleTapConfirmMessage = "Press again to confirm",
}: UseStatefulButtonOptions) {
  const [state, setState] = useState<ButtonState>("default");
  const [isWaitingForConfirm, setIsWaitingForConfirm] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executeAction = useRateLimitedCallback(
    async () => {
      if (state === "loading") return;
      setState("loading");

      try {
        await onAction();
        setState("success");
        onSuccess?.();

        setTimeout(() => {
          setState("default");
        }, 2000);
      } catch (error) {
        setState("error");
        onError?.(error instanceof Error ? error : new Error("Unknown error"));

        setTimeout(() => {
          setState("default");
        }, 2000);
      }
    },
    {
      limit: 1,
      window: rateLimitMs,
    },
  );

  const handleClick = useCallback(async () => {
    if (state === "loading") return;

    if (!doubleTapToConfirm) {
      await executeAction();
      return;
    }

    if (isWaitingForConfirm) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsWaitingForConfirm(false);
      await executeAction();
    } else {
      setIsWaitingForConfirm(true);
      timeoutRef.current = setTimeout(() => {
        setIsWaitingForConfirm(false);
        timeoutRef.current = null;
      }, doubleTapTimeoutMs);
    }
  }, [
    state,
    doubleTapToConfirm,
    isWaitingForConfirm,
    doubleTapTimeoutMs,
    executeAction,
  ]);

  return {
    state,
    handleClick,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    isWaitingForConfirm,
  };
}
