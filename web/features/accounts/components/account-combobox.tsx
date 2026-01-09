"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useAccounts } from "../hooks/use-accounts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, CaretDownIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface AccountComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function AccountCombobox({
  value,
  onValueChange,
  disabled = false,
  label = "Account",
  required = false,
  placeholder = "Search accounts...",
}: AccountComboboxProps) {
  const { data: accounts = [], isLoading } = useAccounts();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.id === value),
    [accounts, value]
  );

  // Filter accounts based on search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const query = searchQuery.toLowerCase();
    return accounts.filter((account) =>
      account.name.toLowerCase().includes(query)
    );
  }, [accounts, searchQuery]);

  // Update search query when selection changes externally
  useEffect(() => {
    if (selectedAccount) {
      setSearchQuery(selectedAccount.name);
    } else if (!value) {
      setSearchQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount?.id, value]);

  const handleSelect = (accountId: string) => {
    onValueChange(accountId);
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      setSearchQuery(account.name);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
    setSearchQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const displayValue = selectedAccount?.name || searchQuery;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="account-combobox">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls="account-combobox-listbox"
            aria-haspopup="listbox"
            disabled={disabled || isLoading}
            className={cn(
              "border-input data-placeholder:text-muted-foreground bg-input/20 dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-md border px-2 py-1.5 text-xs/relaxed transition-colors focus-visible:ring-2 aria-invalid:ring-2 h-7 flex w-full items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50",
              !displayValue && "text-muted-foreground"
            )}
            onClick={() => {
              if (!disabled && !isLoading) {
                setOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }
            }}
          >
            <span className="truncate flex-1 text-left">
              {displayValue || placeholder}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {value && (
                <XIcon
                  className="size-3.5 opacity-50 hover:opacity-100 cursor-pointer"
                  onClick={handleClear}
                />
              )}
              <CaretDownIcon className="text-muted-foreground size-3.5 pointer-events-none shrink-0" />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <div className="p-1">
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                } else if (e.key === "Enter" && filteredAccounts.length === 1) {
                  handleSelect(filteredAccounts[0].id);
                }
              }}
              className="h-7"
            />
          </div>
          <div
            id="account-combobox-listbox"
            role="listbox"
            className="max-h-[300px] overflow-y-auto p-1"
          >
            {filteredAccounts.length === 0 ? (
              <div className="py-6 text-center text-xs/relaxed text-muted-foreground">
                No accounts found
              </div>
            ) : (
              <>
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    role="option"
                    aria-selected={value === account.id}
                    className={cn(
                      "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground min-h-7 gap-2 rounded-md px-2 py-1 text-xs/relaxed relative flex w-full cursor-default items-center outline-hidden select-none",
                      value === account.id && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleSelect(account.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(account.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    <span className="pointer-events-none absolute right-2 flex items-center justify-center">
                      <CheckIcon
                        className={cn(
                          "size-3.5 pointer-events-none",
                          value === account.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </span>
                    <span className="flex-1">{account.name}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
