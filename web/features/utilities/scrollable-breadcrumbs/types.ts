import type { ReactNode, ComponentType, ForwardRefExoticComponent } from "react";

export interface BreadcrumbItem {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }> | ForwardRefExoticComponent<any>;
}

export interface ScrollableBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  renderLink?: (item: BreadcrumbItem, children: ReactNode) => ReactNode;
  separator?: ReactNode;
  autoScroll?: boolean;
  onSidebarChange?: () => void;
}
