"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { useDebouncedValue } from "@tanstack/react-pacer";
import Fuse from "fuse.js";

export interface UseSearchInputOptions<T> {
  data: T[];
  searchKeys: string[];
  debounceMs?: number;
  fuzzyThreshold?: number;
  onSearch?: (query: string, results: T[]) => void;
  /**
   * Name of the URL query parameter for the search query
   * @default "q"
   */
  queryParam?: string;
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
  /**
   * Whether to enable URL state synchronization
   * When enabled, search query will be synced with URL query parameters
   * @default true
   */
  enableUrlSync?: boolean;
}

export function useSearchInput<T>({
  data,
  searchKeys,
  debounceMs = 300,
  fuzzyThreshold = 0.4,
  onSearch,
  queryParam = "q",
  history = "push",
  shallow = false,
  enableUrlSync = true,
}: UseSearchInputOptions<T>) {
  // Use nuqs for URL state synchronization only when enabled
  const [urlQuery, setUrlQuery] = useQueryState(
    queryParam,
    parseAsString.withDefault("").withOptions({
      clearOnDefault: true,
      history,
      shallow,
    })
  );

  // Use local state as fallback when URL sync is disabled
  const [localQuery, setLocalQuery] = useState("");

  // Determine which query state to use
  const query = enableUrlSync ? urlQuery || "" : localQuery;
  const [debouncedQuery] = useDebouncedValue(query, { wait: debounceMs });

  const handleSearch = useCallback(
    (searchQuery: string, searchResults: T[]) => {
      onSearch?.(searchQuery, searchResults);
    },
    [onSearch]
  );

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        keys: searchKeys,
        threshold: fuzzyThreshold,
        includeScore: true,
      }),
    [data, searchKeys, fuzzyThreshold]
  );

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return data;
    }

    const searchResults = fuse.search(debouncedQuery);
    return searchResults.map((result) => result.item);
  }, [debouncedQuery, fuse, data]);

  useEffect(() => {
    handleSearch(debouncedQuery, results);
  }, [debouncedQuery, results, handleSearch]);

  const setQuery = useCallback(
    (value: string) => {
      if (enableUrlSync) {
        setUrlQuery(value || null);
      } else {
        setLocalQuery(value);
      }
    },
    [enableUrlSync, setUrlQuery]
  );

  return {
    query,
    setQuery,
    results,
    isSearching: debouncedQuery !== query,
  };
}
