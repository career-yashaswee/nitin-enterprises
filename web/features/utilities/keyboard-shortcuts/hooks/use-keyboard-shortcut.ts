import { useHotkeys } from "react-hotkeys-hook";

export interface UseKeyboardShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  keys: string,
  callback: () => void,
  options?: UseKeyboardShortcutOptions,
) {
  useHotkeys(
    keys,
    (e) => {
      if (options?.preventDefault !== false) {
        e.preventDefault();
      }
      callback();
    },
    { enabled: options?.enabled !== false },
  );
}
