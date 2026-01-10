"use client";

import {
  useQueryStates,
  parseAsString,
  parseAsBoolean,
  parseAsArrayOf,
} from "nuqs";
import type { FilterValue } from "../types";

export interface UseFilterSheetOptions<
  T extends Record<string, FilterValue> = Record<string, FilterValue>,
> {
  /**
   * Configuration for individual filter parameters
   * Key is the filter ID, value is the default value
   */
  defaults?: T;
  /**
   * History mode for URL updates
   * 'push' - adds new history entry (default)
   * 'replace' - replaces current history entry
   */
  history?: "push" | "replace";
  /**
   * Whether to use shallow routing (Next.js only)
   */
  shallow?: boolean;
}

export interface UseFilterSheetReturn<
  T extends Record<string, FilterValue> = Record<string, FilterValue>,
> {
  /**
   * Get the current value of a filter
   * @throws {Error} If the filter ID is not defined in defaults
   */
  getFilter: <K extends keyof T>(id: K) => T[K] | null;
  /**
   * Set the value of a filter
   * @throws {Error} If the filter ID is not defined in defaults
   */
  setFilter: <K extends keyof T>(id: K, value: T[K] | null) => Promise<void>;
  /**
   * Clear a specific filter
   * @throws {Error} If the filter ID is not defined in defaults
   */
  clearFilter: <K extends keyof T>(id: K) => Promise<void>;
  /**
   * Clear all filters defined in the defaults (i.e., keys present in filterParsers).
   * Sets those filters to null, which triggers clearOnDefault behavior.
   */
  clearAllFilters: () => Promise<void>;
  /**
   * Get all filter values as an object.
   * Returns values only for filters defined in the defaults (i.e., keys present in filterParsers).
   */
  getAllFilters: () => Partial<Record<keyof T, FilterValue | null>>;
}

/**
 * Hook for managing filter state in URL query parameters
 * Uses URL state synchronization to persist filter values in the URL
 *
 * @example
 * ```tsx
 * const { getFilter, setFilter, clearAllFilters } = useFilterSheet({
 *   defaults: {
 *     difficulty: "ALL",
 *     status: "ALL",
 *     favoriteOnly: false,
 *   },
 * });
 *
 * Get filter value (type-safe - only accepts keys from defaults)
 * const difficulty = getFilter("difficulty");
 *
 * Set filter value (type-safe - only accepts keys from defaults)
 * await setFilter("difficulty", "EASY");
 *
 *  Clear all filters
 * await clearAllFilters();
 * ```
 */
export function useFilterSheet<
  T extends Record<string, FilterValue> = Record<string, FilterValue>,
>(options: UseFilterSheetOptions<T> = {}): UseFilterSheetReturn<T> {
  const { defaults = {} as T, history = "push", shallow = false } = options;

  // Create parsers for all filter keys
  // Using Record<string, any> to allow different parser types per key
  // This is necessary because each key can have a different parser type (string, boolean, or string[])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterParsers: Record<string, any> = {};
  const filterDefaults: Record<string, FilterValue> = {};
  const validFilterKeys = new Set<string>(Object.keys(defaults));

  // Build parsers and defaults
  Object.entries(defaults).forEach(([key, defaultValue]) => {
    if (typeof defaultValue === "boolean") {
      filterParsers[key] = parseAsBoolean
        .withDefault(defaultValue)
        .withOptions({
          clearOnDefault: true,
        });
    } else if (Array.isArray(defaultValue)) {
      filterParsers[key] = parseAsArrayOf(parseAsString)
        .withDefault(defaultValue)
        .withOptions({
          clearOnDefault: true,
        });
    } else {
      filterParsers[key] = parseAsString
        .withDefault(String(defaultValue || ""))
        .withOptions({
          clearOnDefault: true,
        });
    }
    filterDefaults[key] = defaultValue;
  });

  // Use useQueryStates for batch updates
  const [filterStates, setFilterStates] = useQueryStates(filterParsers, {
    history,
    shallow,
  });

  const getFilter = <K extends keyof T>(id: K): T[K] | null => {
    // Runtime validation for invalid IDs (TypeScript should catch these, but this provides runtime safety)
    if (!validFilterKeys.has(id as string)) {
      const error = new Error(
        `Invalid filter ID: "${String(id)}". Valid filter IDs are: ${Array.from(
          validFilterKeys,
        )
          .map((k) => `"${k}"`)
          .join(", ")}`,
      );
      console.error(error.message);
      throw error;
    }

    const value = filterStates[id as string];
    if (value === undefined || value === null) {
      return (defaults[id] ?? null) as T[K] | null;
    }
    return value as T[K];
  };

  const setFilter = async <K extends keyof T>(
    id: K,
    value: T[K] | null,
  ): Promise<void> => {
    // Runtime validation for invalid IDs (TypeScript should catch these, but this provides runtime safety)
    if (!validFilterKeys.has(id as string)) {
      const error = new Error(
        `Invalid filter ID: "${String(id)}". Valid filter IDs are: ${Array.from(
          validFilterKeys,
        )
          .map((k) => `"${k}"`)
          .join(", ")}`,
      );
      console.error(error.message);
      throw error;
    }

    if (value === null) {
      // Remove from URL by setting to null (will trigger clearOnDefault)
      await setFilterStates({
        [id]: null as string | boolean | string[] | null,
      });
    } else {
      // Set the value - clearOnDefault will handle removing it if it matches default
      await setFilterStates({ [id]: value as string | boolean | string[] });
    }
  };

  const clearFilter = async <K extends keyof T>(id: K): Promise<void> => {
    await setFilter(id, null);
  };

  /**
   * Clear all filters defined in the defaults (i.e., keys present in filterParsers).
   * Sets those filters to null, which triggers clearOnDefault behavior.
   */
  const clearAllFilters = async (): Promise<void> => {
    // Clear all filters by setting them to null (will trigger clearOnDefault)
    const resetValues: Record<string, null> = {};
    Object.keys(filterParsers).forEach((key) => {
      resetValues[key] = null;
    });
    await setFilterStates(
      resetValues as Record<string, string | boolean | string[] | null>,
    );
  };

  /**
   * Get all filter values as an object.
   * Returns values only for filters defined in the defaults (i.e., keys present in filterParsers).
   */
  const getAllFilters = (): Partial<Record<keyof T, FilterValue | null>> => {
    const all: Partial<Record<keyof T, FilterValue | null>> = {};
    Object.keys(filterParsers).forEach((key) => {
      all[key as keyof T] = getFilter(key as keyof T);
    });
    return all;
  };

  return {
    getFilter,
    setFilter,
    clearFilter,
    clearAllFilters,
    getAllFilters,
  };
}
