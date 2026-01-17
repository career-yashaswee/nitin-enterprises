export interface Shortcut {
  keys: string[];
  description: string;
  category?: string;
}

export interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  triggerKey?: string;
  showHelp?: boolean;
  className?: string;
}
