"use client";

import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { KeyboardShortcutsProps, Shortcut } from "../types";

export function KeyboardShortcuts({
  shortcuts,
  triggerKey = "mod+k",
  showHelp = true,
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  useHotkeys(
    triggerKey,
    (e) => {
      e.preventDefault();
      if (showHelp) {
        setIsOpen(true);
      }
    },
    { enabled: showHelp },
  );

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>,
  );

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      mod: navigator.platform.includes("Mac") ? "⌘" : "Ctrl",
      ctrl: "Ctrl",
      alt: "Alt",
      shift: "Shift",
      meta: "⌘",
      enter: "Enter",
      escape: "Esc",
      backspace: "Backspace",
      delete: "Delete",
      arrowup: "↑",
      arrowdown: "↓",
      arrowleft: "←",
      arrowright: "→",
    };

    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <>
      {showHelp && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Press {formatKey(triggerKey)} to open this dialog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {Object.entries(groupedShortcuts).map(
                ([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                        >
                          <span className="text-sm text-muted-foreground">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <div
                                key={keyIndex}
                                className="flex items-center gap-1"
                              >
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs font-normal"
                                >
                                  {formatKey(key)}
                                </Badge>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    +
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
