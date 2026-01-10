import { useCallback, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export interface UseOptimisticActionButtonOptions {
  action: () => Promise<void>;
  optimisticState: boolean;
  onOptimisticUpdate: () => void;
  onRollback: () => void;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  doubleTapToConfirm?: boolean;
  doubleTapTimeoutMs?: number;
  doubleTapConfirmMessage?: string;
}

export function useOptimisticActionButton({
  action,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  optimisticState: _optimisticState,
  onOptimisticUpdate,
  onRollback,
  loadingMessage = "Processing",
  successMessage = "Action completed successfully.",
  errorMessage = "Action failed. Please try again.",
  onSuccess,
  onError,
  doubleTapToConfirm = false,
  doubleTapTimeoutMs = 3000,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  doubleTapConfirmMessage: _doubleTapConfirmMessage = "Press again to confirm",
}: UseOptimisticActionButtonOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForConfirm, setIsWaitingForConfirm] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executeAction = useCallback(() => {
    if (isLoading) return;

    onOptimisticUpdate();
    setIsLoading(true);

    const actionPromise = Promise.resolve(action())
      .then(() => {
        onSuccess?.();
      })
      .catch((error) => {
        onRollback();
        const err = error instanceof Error ? error : new Error("Action failed");
        onError?.(err);
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });

    toast.promise(actionPromise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    });
  }, [
    isLoading,
    action,
    onOptimisticUpdate,
    onRollback,
    loadingMessage,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  ]);

  const handleClick = useCallback(() => {
    if (isLoading) return;

    if (!doubleTapToConfirm) {
      executeAction();
      return;
    }

    if (isWaitingForConfirm) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsWaitingForConfirm(false);
      executeAction();
    } else {
      setIsWaitingForConfirm(true);
      timeoutRef.current = setTimeout(() => {
        setIsWaitingForConfirm(false);
        timeoutRef.current = null;
      }, doubleTapTimeoutMs);
    }
  }, [
    isLoading,
    doubleTapToConfirm,
    isWaitingForConfirm,
    doubleTapTimeoutMs,
    executeAction,
  ]);

  return {
    isLoading,
    isWaitingForConfirm,
    handleClick,
  };
}
