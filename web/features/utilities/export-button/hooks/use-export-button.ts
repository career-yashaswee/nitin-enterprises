import { useCallback, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { stringify } from "csv-stringify/sync";

export interface UseExportButtonOptions {
  fetchData: () => Promise<unknown[]>;
  filename?: string;
  resource?: string;
  format?: "csv" | "json";
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

function convertToCSV(data: unknown[]): string {
  if (!data.length) return "";

  try {
    return stringify(data, {
      header: true,
      cast: {
        boolean: (value) => String(value),
        date: (value) => value.toISOString(),
        number: (value) => String(value),
      },
    });
  } catch {
    throw new Error("Failed to convert data to CSV");
  }
}

function convertToJSON(data: unknown[]): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to convert data to JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function generateFilename(prefix: string, format: "csv" | "json"): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, -5);

  return `${prefix}-${timestamp}.${format}`;
}

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function useExportButton({
  fetchData,
  filename = "export",
  resource = "data",
  format = "csv",
  onSuccess,
  onError,
}: UseExportButtonOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleExport = useCallback(async () => {
    if (isExporting) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const exportPromise = (async () => {
      setIsExporting(true);
      setHasExported(false);

      try {
        const data = await fetchData();

        if (!Array.isArray(data) || !data.length) {
          throw new Error("No data available to export");
        }

        const content =
          format === "csv" ? convertToCSV(data) : convertToJSON(data);
        const mimeType =
          format === "csv"
            ? "text/csv;charset=utf-8;"
            : "application/json;charset=utf-8;";

        const blob = new Blob([content], { type: mimeType });
        const downloadFilename = generateFilename(filename, format);

        downloadFile(blob, downloadFilename);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setHasExported(true);
        timeoutRef.current = setTimeout(() => {
          setHasExported(false);
          timeoutRef.current = null;
        }, 2000);
        onSuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Export failed");
        onError?.(err);
        throw err;
      } finally {
        setIsExporting(false);
      }
    })();

    toast.promise(exportPromise, {
      loading: `Preparing ${resource} export`,
      success: `${resource} exported successfully!`,
      error: `Failed to export ${resource}.`,
    });
  }, [fetchData, filename, resource, format, isExporting, onSuccess, onError]);

  return {
    isExporting,
    hasExported,
    handleExport,
  };
}
