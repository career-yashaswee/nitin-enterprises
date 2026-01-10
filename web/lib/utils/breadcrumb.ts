import type { BreadcrumbItem } from "@/features/utilities/scrollable-breadcrumbs/types";

/**
 * Generates breadcrumb items from a pathname
 * @param pathname - The current pathname (e.g., "/features/search-input")
 * @param homeIcon - Optional icon component for the home breadcrumb
 * @param currentPageIcon - Optional icon component for the current page breadcrumb
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbItems(
  pathname: string,
  homeIcon?: React.ComponentType<{ className?: string }>,
  currentPageIcon?: React.ComponentType<{ className?: string }>
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      href: "/",
      label: "Home",
      icon: homeIcon,
    },
  ];

  if (pathname && pathname !== "/") {
    const segments = pathname.split("/").filter(Boolean);
    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label =
        segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") || segment;
      items.push({
        href,
        label,
        icon: index === segments.length - 1 ? currentPageIcon : undefined,
      });
    });
  }

  return items;
}
