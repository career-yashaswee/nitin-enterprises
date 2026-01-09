'use client';

import { useDebouncedValue as useDebouncedValuePacer } from '@tanstack/react-pacer';

/**
 * Hook to debounce a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue] = useDebouncedValuePacer(value, { wait: delay });
  return debouncedValue;
}
