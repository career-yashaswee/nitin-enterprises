'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  House,
  Users,
  Package,
  ShoppingCart,
  ArrowSquareOut,
  ArrowSquareIn,
  Warehouse,
  Gear,
  SignOut,
} from '@phosphor-icons/react';

const navItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}> = [
  { href: '/', label: 'Dashboard', icon: House },
  { href: '/accounts', label: 'Accounts', icon: Users },
  { href: '/goods-in', label: 'Goods In', icon: Package },
  { href: '/goods-out', label: 'Goods Out', icon: ShoppingCart },
  { href: '/payment-in', label: 'Payment In', icon: ArrowSquareIn },
  { href: '/payment-out', label: 'Payment Out', icon: ArrowSquareOut },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/users', label: 'Users', icon: Users, adminOnly: true },
  { href: '/settings', label: 'Settings', icon: Gear },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { signOut, user, role } = useAuth();

  // Filter nav items based on role
  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-2">
          <h1 className="text-lg font-bold">Nitin Enterprises</h1>
          <p className="text-xs text-muted-foreground">Inventory Management</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1.5">
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <SignOut className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
