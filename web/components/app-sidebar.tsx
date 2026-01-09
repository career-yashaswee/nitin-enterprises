"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  House,
  Users,
  Package,
  ShoppingCart,
  ArrowSquareOut,
  ArrowSquareIn,
  Warehouse,
  Gear,
  Command,
} from "@phosphor-icons/react";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";

const navItems: Array<{
  url: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}> = [
  { url: "/", title: "Dashboard", icon: House },
  { url: "/accounts", title: "Accounts", icon: Users },
  { url: "/goods-in", title: "Goods In", icon: Package },
  { url: "/goods-out", title: "Goods Out", icon: ShoppingCart },
  { url: "/payment-in", title: "Payment In", icon: ArrowSquareIn },
  { url: "/payment-out", title: "Payment Out", icon: ArrowSquareOut },
  { url: "/inventory", title: "Inventory", icon: Warehouse },
  { url: "/users", title: "Users", icon: Users, adminOnly: true },
  { url: "/settings", title: "Settings", icon: Gear },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { signOut, user, role } = useAuth();

  // Filter nav items based on role
  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && role !== "admin") {
      return false;
    }
    return true;
  });

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Nitin Enterprises
                  </span>
                  <span className="truncate text-xs">Inventory Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <SidebarGroup>
          <SidebarGrouptitle>Navigation</SidebarGrouptitle>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link url={item.url}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.user_metadata?.name || "",
            email: user?.email || "",
            avatar: user?.user_metadata?.avatar || "",
          }}
          onSignOut={() => signOut()}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
