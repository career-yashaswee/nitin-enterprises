'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

const navItems = [
  { href: '/', label: 'Dashboard', icon: House },
  { href: '/accounts', label: 'Accounts', icon: Users },
  { href: '/goods-in', label: 'Goods In', icon: Package },
  { href: '/goods-out', label: 'Goods Out', icon: ShoppingCart },
  { href: '/payment-in', label: 'Payment In', icon: ArrowSquareIn },
  { href: '/payment-out', label: 'Payment Out', icon: ArrowSquareOut },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/settings', label: 'Settings', icon: Gear },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  return (
    <nav className="border-r bg-card h-screen w-64 p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Nitin Enterprises</h1>
        <p className="text-xs text-muted-foreground">Inventory Management</p>
      </div>
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
              >
                <Icon className="size-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
      <div className="border-t pt-4 space-y-2">
        <div className="text-xs text-muted-foreground px-2">
          {user?.email}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <SignOut className="size-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
