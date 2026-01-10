import type { ReactNode } from "react";
import type { UseSearchInputOptions } from "./hooks/use-search-input";

export interface SearchInputProps<T> extends UseSearchInputOptions<T> {
  placeholder?: string;
  className?: string;
  onResultClick?: (item: T) => void;
  renderResult?: (item: T) => ReactNode;
}
