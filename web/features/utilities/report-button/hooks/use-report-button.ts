import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReportPayload } from "../types";

export interface UseReportButtonOptions {
  onSubmit: (payload: ReportPayload) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useReportButton({
  onSubmit,
  onSuccess,
  onError,
}: UseReportButtonOptions) {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [customIssue, setCustomIssue] = useState("");
  const [description, setDescription] = useState("");
  const [pageContext] = useState<{
    path?: string;
    url?: string;
  }>(() => {
    if (typeof window !== "undefined") {
      return {
        path: window.location.pathname,
        url: window.location.href,
      };
    }
    return {};
  });

  const resetForm = useCallback(() => {
    setSelectedIssues([]);
    setCustomIssue("");
    setDescription("");
  }, []);

  const mutation = useMutation({
    mutationFn: async (payload: ReportPayload) => {
      await onSubmit(payload);
    },
    onSuccess: () => {
      toast.success("Report submitted", {
        description:
          "Thanks for the feedback. Our team will review this shortly.",
        duration: 3500,
      });
      resetForm();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("Unable to submit report", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        duration: 3500,
      });
      onError?.(error);
    },
  });

  const handleIssueToggle = useCallback((issueId: string, checked: boolean) => {
    setSelectedIssues((prev) => {
      if (checked) {
        if (prev.includes(issueId)) return prev;
        return [...prev, issueId];
      }
      const newIssues = prev.filter((item) => item !== issueId);
      if (issueId === "OTHER") {
        setCustomIssue("");
      }
      return newIssues;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (mutation.isPending) return;

    const trimmedCustom = customIssue.trim();
    const trimmedDescription = description.trim();
    const reportIssues = selectedIssues;

    if (reportIssues.length === 0 && !trimmedCustom && !trimmedDescription) {
      toast.warning("Add a report", {
        description:
          "Select an issue or add a short note so we know what to fix.",
        duration: 3000,
      });
      return;
    }

    mutation.mutate({
      issues: reportIssues,
      customIssue: trimmedCustom || undefined,
      description: trimmedDescription || undefined,
      context: pageContext,
    });
  }, [customIssue, description, mutation, pageContext, selectedIssues]);

  const isSubmitDisabled =
    mutation.isPending ||
    (selectedIssues.length === 0 &&
      customIssue.trim().length === 0 &&
      description.trim().length === 0);

  return {
    selectedIssues,
    customIssue,
    description,
    setCustomIssue,
    setDescription,
    handleIssueToggle,
    handleSubmit,
    resetForm,
    isSubmitDisabled,
    isPending: mutation.isPending,
  };
}
