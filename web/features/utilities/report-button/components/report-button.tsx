"use client";

import { useState } from "react";
import { Flag, Check, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { ReportButtonProps } from "../types";
import { useReportButton } from "../hooks/use-report-button";
import { StatefulButton } from "@/features/utilities/stateful-button";

export function ReportButton({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reportId: _reportId,
  reportTitle,
  issues,
  onSubmit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerLabel = "Report",
  className,
  variant = "outline",
  size = "sm",
}: ReportButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const {
    selectedIssues,
    customIssue,
    description,
    setCustomIssue,
    setDescription,
    handleIssueToggle,
    handleSubmit,
    resetForm,
    isSubmitDisabled,
    isPending,
  } = useReportButton({
    onSubmit,
    onSuccess: () => {
      setIsOpen(false);
    },
  });

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      resetForm();
    }
    setIsOpen(open);
  };

  const buttonSize = size === "md" ? "default" : size;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant={variant} size={buttonSize} className={className}>
            <Flag size={16} />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report {reportTitle}</DialogTitle>
          <DialogDescription>
            Flag issues with &quot;{reportTitle}&quot; so we can investigate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/40 px-4 py-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Problem
            </p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {reportTitle}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Issues encountered
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {issues.map((issue) => {
                const isSelected = selectedIssues.includes(issue.id);

                return (
                  <div
                    key={issue.id}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${
                      isSelected
                        ? "border-primary/70 bg-primary/10"
                        : "hover:border-primary/50 hover:bg-muted/40"
                    }`}
                  >
                    <Checkbox
                      id={`report-${issue.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleIssueToggle(issue.id, checked === true)
                      }
                      className="mt-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`report-${issue.id}`}
                        className="text-sm font-medium text-foreground block"
                      >
                        {issue.label}
                      </Label>
                      <p className="text-xs text-muted-foreground leading-5">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {selectedIssues.includes("OTHER") && (
              <div className="space-y-2">
                <Label
                  htmlFor="report-custom-issue"
                  className="text-sm text-foreground"
                >
                  Add your own issue
                </Label>
                <Input
                  id="report-custom-issue"
                  placeholder="Summarize what is wrong"
                  value={customIssue}
                  onChange={(event) => setCustomIssue(event.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="report-details"
                className="text-sm text-foreground"
              >
                Additional details
              </Label>
              <Textarea
                id="report-details"
                placeholder="Share details, examples, or steps to reproduce..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/2000
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Reports are private and help us improve.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="inline-flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </Button>
              <StatefulButton
                size="sm"
                disabled={isSubmitDisabled}
                onAction={async () => {
                  handleSubmit();
                }}
                className="inline-flex items-center gap-2 !text-white"
              >
                <Check size={16} />
                Submit report
              </StatefulButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
