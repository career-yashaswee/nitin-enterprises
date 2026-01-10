"use client";

import React from "react";
import { Sliders, Star, Tag } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FilterSheetProps, Filter } from "../types";

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  title = "Filters",
  description = "Filter by various criteria",
  onClearAll,
  clearAllLabel = "Clear All Filters",
  className,
  side = "right",
  width = "w-[400px] sm:w-[540px]",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enableUrlSync: _enableUrlSync,
  useNuqs,
}: FilterSheetProps) {
  // Show deprecation warning if useNuqs is used
  if (process.env.NODE_ENV !== "production" && useNuqs !== undefined) {
    console.warn(
      "[FilterSheet] The `useNuqs` prop is deprecated. Please use `enableUrlSync` instead. " +
        "The `useNuqs` prop will be removed in a future version.",
    );
  }
  const hasActiveFilters = filters.some((filter) => {
    if (filter.type === "select") {
      return filter.value && filter.value !== "ALL" && filter.value !== "";
    }
    if (filter.type === "checkbox") {
      return filter.checked;
    }
    if (filter.type === "multiselect") {
      return filter.selectedValues.length > 0;
    }
    if (filter.type === "tags") {
      return filter.selectedTags.length > 0;
    }
    return false;
  });

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      // Default clear behavior
      filters.forEach((filter) => {
        if (filter.type === "select") {
          filter.onChange("ALL");
        } else if (filter.type === "checkbox") {
          filter.onChange(false);
        } else if (filter.type === "multiselect") {
          filter.onChange([]);
        } else if (filter.type === "tags") {
          filter.onChange([]);
        }
      });
    }
  };

  const renderFilterIcon = (
    icon: Filter["icon"],
    defaultIcon: React.ComponentType<{
      className?: string;
    }> = Sliders,
  ) => {
    if (icon) {
      const IconComponent = icon;
      return <IconComponent className="h-4 w-4" />;
    }
    const DefaultIcon = defaultIcon;
    return <DefaultIcon className="h-4 w-4" />;
  };

  const renderSelectFilter = (filter: Extract<Filter, { type: "select" }>) => {
    return (
      <div key={filter.id} className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          {renderFilterIcon(filter.icon)}
          {filter.label}
        </Label>
        <Select value={filter.value || "ALL"} onValueChange={filter.onChange}>
          <SelectTrigger>
            <SelectValue
              placeholder={filter.placeholder || `All ${filter.label}`}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All {filter.label}</SelectItem>
            {filter.options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  {OptionIcon ? (
                    <div className="flex items-center gap-2">
                      <OptionIcon
                        className={cn(
                          "h-4 w-4",
                          option.iconColor || "text-current",
                        )}
                      />
                      {option.label}
                    </div>
                  ) : (
                    option.label
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderCheckboxFilter = (
    filter: Extract<Filter, { type: "checkbox" }>,
  ) => {
    return (
      <div key={filter.id} className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          {renderFilterIcon(filter.icon, Star)}
          {filter.label}
        </Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={filter.id}
            checked={filter.checked}
            onCheckedChange={filter.onChange}
          />
          <Label
            htmlFor={filter.id}
            className="text-sm font-normal cursor-pointer"
          >
            {filter.description || `Show only ${filter.label.toLowerCase()}`}
          </Label>
        </div>
      </div>
    );
  };

  const renderMultiSelectFilter = (
    filter: Extract<Filter, { type: "multiselect" }>,
  ) => {
    const handleToggle = (optionId: string) => {
      if (filter.selectedValues.includes(optionId)) {
        filter.onChange(filter.selectedValues.filter((id) => id !== optionId));
      } else {
        filter.onChange([...filter.selectedValues, optionId]);
      }
    };

    return (
      <div key={filter.id} className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          {renderFilterIcon(filter.icon)}
          {filter.label}
        </Label>
        <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
          {filter.options.map((option) => {
            const OptionIcon = option.icon;
            return (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filter.id}-${option.id}`}
                  checked={filter.selectedValues.includes(option.id)}
                  onCheckedChange={() => handleToggle(option.id)}
                />
                <Label
                  htmlFor={`${filter.id}-${option.id}`}
                  className="text-sm font-normal cursor-pointer flex-1 flex items-center gap-2"
                >
                  {option.iconUrl ? (
                    <div className="h-5 w-5 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={option.iconUrl}
                        alt={option.label}
                        className="h-full w-full object-contain"
                        style={{ filter: "grayscale(100%)" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : OptionIcon ? (
                    <OptionIcon className="h-4 w-4 shrink-0" />
                  ) : null}
                  <span className="truncate">{option.label}</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTagFilter = (filter: Extract<Filter, { type: "tags" }>) => {
    const handleTagToggle = (tag: string) => {
      if (filter.selectedTags.includes(tag)) {
        filter.onChange(filter.selectedTags.filter((t) => t !== tag));
      } else {
        filter.onChange([...filter.selectedTags, tag]);
      }
    };

    return (
      <div key={filter.id} className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          {renderFilterIcon(filter.icon, Tag)}
          {filter.label}
        </Label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
          {filter.availableTags.map((tag) => (
            <Badge
              key={tag}
              variant={
                filter.selectedTags.includes(tag) ? "default" : "secondary"
              }
              className="cursor-pointer"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(width, "overflow-y-auto p-6", className)}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            {title}
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-1">
          {filters.map((filter) => {
            switch (filter.type) {
              case "select":
                return renderSelectFilter(filter);
              case "checkbox":
                return renderCheckboxFilter(filter);
              case "multiselect":
                return renderMultiSelectFilter(filter);
              case "tags":
                return renderTagFilter(filter);
              default:
                return null;
            }
          })}

          {/* Clear Filters Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearAll}
              disabled={!hasActiveFilters}
            >
              {clearAllLabel}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
