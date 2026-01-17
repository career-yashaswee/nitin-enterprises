"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { ScrollableBreadcrumb } from "@/features/utilities/scrollable-breadcrumbs";
import type { BreadcrumbItem } from "@/features/utilities/scrollable-breadcrumbs/types";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";
import {
  House,
  Users,
  Package,
  ShoppingCart,
  ArrowSquareOut,
  ArrowSquareIn,
  Warehouse,
  Gear,
} from "@phosphor-icons/react";
import { useKeyboardShortcut } from "@/features/utilities/keyboard-shortcuts/hooks/use-keyboard-shortcut";

const routeMap: Record<
  string,
  { label: string; icon: BreadcrumbItem["icon"] }
> = {
  "/": { label: "Dashboard", icon: House },
  "/accounts": { label: "Accounts", icon: Users },
  "/goods-in": { label: "Goods In", icon: Package },
  "/goods-out": { label: "Goods Out", icon: ShoppingCart },
  "/payment-in": { label: "Payment In", icon: ArrowSquareIn },
  "/payment-out": { label: "Payment Out", icon: ArrowSquareOut },
  "/inventory": { label: "Inventory", icon: Warehouse },
  "/users": { label: "Users", icon: Users },
  "/settings": { label: "Settings", icon: Gear },
};

function BreadcrumbContent() {
  const pathname = usePathname();

  const handleSidebarChange = useCallback(() => {
    // This function will be recreated when state changes, triggering the scroll effect
  }, []);

  const breadcrumbItems = useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        href: "/",
        label: "Dashboard",
        icon: House,
      },
    ];

    if (pathname && pathname !== "/") {
      const route = routeMap[pathname];
      if (route) {
        items.push({
          href: pathname,
          label: route.label,
          icon: route.icon,
        });
      } else {
        // Handle nested routes
        const segments = pathname.split("/").filter(Boolean);
        segments.forEach((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const route = routeMap[href];
          if (route) {
            items.push({
              href,
              label: route.label,
              icon: route.icon,
            });
          } else {
            items.push({
              href,
              label: segment.charAt(0).toUpperCase() + segment.slice(1),
            });
          }
        });
      }
    }

    return items;
  }, [pathname]);

  return (
    <ScrollableBreadcrumb
      items={breadcrumbItems}
      onSidebarChange={handleSidebarChange}
      renderLink={(item, children) => (
        <a
          href={item.href}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          {children}
        </a>
      )}
    />
  );
}

function GlobalKeyboardShortcuts() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  // Navigation shortcuts
  useKeyboardShortcut("mod+1", () => router.push("/"));
  useKeyboardShortcut("mod+2", () => router.push("/accounts"));
  useKeyboardShortcut("mod+3", () => router.push("/goods-in"));
  useKeyboardShortcut("mod+4", () => router.push("/goods-out"));
  useKeyboardShortcut("mod+5", () => router.push("/payment-in"));
  useKeyboardShortcut("mod+6", () => router.push("/payment-out"));
  useKeyboardShortcut("mod+7", () => router.push("/inventory"));
  useKeyboardShortcut("mod+8", () => router.push("/users"));
  useKeyboardShortcut("mod+9", () => router.push("/settings"));

  // Sidebar toggle
  useKeyboardShortcut("mod+b", () => toggleSidebar());

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <GlobalKeyboardShortcuts />
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4 flex-1 min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex-1 min-w-0">
              <BreadcrumbContent />
            </div>
          </div>
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// import { AppSidebar } from "@/components/app-sidebar";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";

// export default function Page() {
//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <Separator
//               orientation="vertical"
//               className="mr-2 data-[orientation=vertical]:h-4"
//             />
//             <Breadcrumb>
//               <BreadcrumbList>
//                 <BreadcrumbItem className="hidden md:block">
//                   <BreadcrumbLink href="#">
//                     Building Your Application
//                   </BreadcrumbLink>
//                 </BreadcrumbItem>
//                 <BreadcrumbSeparator className="hidden md:block" />
//                 <BreadcrumbItem>
//                   <BreadcrumbPage>Data Fetching</BreadcrumbPage>
//                 </BreadcrumbItem>
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//         </header>
//         <div className="flex flex-1 flex-col overflow-y-auto p-2">
//           {children}
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }
