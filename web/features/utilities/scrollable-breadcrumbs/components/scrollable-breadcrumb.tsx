"use client";

import { Fragment, useEffect, useRef } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ScrollableBreadcrumbProps } from "../types";

export function ScrollableBreadcrumb({
  items,
  className,
  renderLink,
  separator,
  autoScroll = true,
  onSidebarChange,
}: ScrollableBreadcrumbProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the right (current page) when items change
  useEffect(() => {
    if (!autoScroll || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    // Scroll to the rightmost position to show the current page
    container.scrollLeft = container.scrollWidth - container.clientWidth;
  }, [items, autoScroll]);

  // Re-scroll when sidebar state changes (if callback provided)
  useEffect(() => {
    if (!onSidebarChange || !scrollContainerRef.current) return;
    const c = scrollContainerRef.current;
    c.scrollLeft = c.scrollWidth - c.clientWidth;
  }, [onSidebarChange]);

  // Re-scroll on window resize
  useEffect(() => {
    if (!autoScroll) return;
    const handler = () => {
      if (!scrollContainerRef.current) return;
      const c = scrollContainerRef.current;
      c.scrollLeft = c.scrollWidth - c.clientWidth;
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [autoScroll]);

  const defaultRenderLink = (
    item: (typeof items)[0],
    children: React.ReactNode
  ) => {
    return (
      <a
        href={item.href}
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
      >
        {children}
      </a>
    );
  };

  const linkRenderer = renderLink || defaultRenderLink;
  const separatorElement = separator || <CaretRight className="h-3.5 w-3.5" />;

  return (
    <div className="relative w-full h-10">
      {/* Left fade indicator */}
      {/* <div className="absolute left-0 top-0 bottom-0 w-2 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" /> */}
      {/* Right fade indicator */}
      {/* <div className="absolute right-0 top-0 bottom-0 w-2 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" /> */}

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex items-center overflow-x-auto scrollbar-hide gap-2 px-2",
          "scroll-smooth w-full h-10",
          "min-w-0", // Allow shrinking
          "bg-muted/40",
          className
        )}
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
          WebkitOverflowScrolling: "touch", // iOS smooth scrolling
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          const content = (
            <>
              {Icon && (
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              )}
              {item.label}
            </>
          );

          return (
            <Fragment key={`${item.href}-${index}`}>
              <div className="flex items-center gap-1.5 whitespace-nowrap px-2 py-0 rounded-md hover:bg-muted/30 transition-colors">
                {isLast ? (
                  <span className="inline-flex items-center gap-1.5 text-foreground font-medium text-sm">
                    {content}
                  </span>
                ) : (
                  linkRenderer(item, content)
                )}
              </div>
              {!isLast && (
                <div className="flex items-center text-muted-foreground">
                  {separatorElement}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
