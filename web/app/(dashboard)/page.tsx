"use client";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { useGoodsIn } from "@/features/goods-in/hooks/use-goods-in";
import { useGoodsOut } from "@/features/goods-out/hooks/use-goods-out";
import { usePaymentIn } from "@/features/payment-in/hooks/use-payment-in";
import { usePaymentOut } from "@/features/payment-out/hooks/use-payment-out";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  ShoppingCart,
  ArrowSquareIn,
  ArrowSquareOut,
  Warehouse,
} from "@phosphor-icons/react";

export default function DashboardPage() {
  const { data: accounts } = useAccounts();
  const { data: goodsIn } = useGoodsIn();
  const { data: goodsOut } = useGoodsOut();
  const { data: paymentsIn } = usePaymentIn();
  const { data: paymentsOut } = usePaymentOut();
  const { data: inventory } = useInventory();

  const totalGoodsIn =
    goodsIn?.reduce((sum, receipt) => sum + receipt.total_amount, 0) || 0;
  const totalGoodsOut =
    goodsOut?.reduce((sum, receipt) => sum + receipt.total_amount, 0) || 0;
  const totalPaymentsIn =
    paymentsIn?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const totalPaymentsOut =
    paymentsOut?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const totalInventoryItems = inventory?.length || 0;
  const lowStockItems =
    inventory?.filter((item) => item.available_quantity < 10).length || 0;

  const stats = [
    {
      title: "Total Accounts",
      value: accounts?.length || 0,
      icon: Users,
      href: "/accounts",
    },
    {
      title: "Goods In Receipts",
      value: goodsIn?.length || 0,
      icon: Package,
      href: "/goods-in",
      subtitle: `₹${totalGoodsIn.toFixed(2)}`,
    },
    {
      title: "Goods Out Receipts",
      value: goodsOut?.length || 0,
      icon: ShoppingCart,
      href: "/goods-out",
      subtitle: `₹${totalGoodsOut.toFixed(2)}`,
    },
    {
      title: "Payments In",
      value: paymentsIn?.length || 0,
      icon: ArrowSquareIn,
      href: "/payment-in",
      subtitle: `₹${totalPaymentsIn.toFixed(2)}`,
    },
    {
      title: "Payments Out",
      value: paymentsOut?.length || 0,
      icon: ArrowSquareOut,
      href: "/payment-out",
      subtitle: `₹${totalPaymentsOut.toFixed(2)}`,
    },
    {
      title: "Inventory Items",
      value: totalInventoryItems,
      icon: Warehouse,
      href: "/inventory",
      subtitle:
        lowStockItems > 0 ? `${lowStockItems} low stock` : "All in stock",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your inventory management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.href} href={stat.href}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{stat.title}</CardTitle>
                      <Icon className="size-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.subtitle && (
                      <CardDescription className="mt-1">
                        {stat.subtitle}
                      </CardDescription>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/accounts">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="size-4 mr-2" />
                  Add New Account
                </Button>
              </Link>
              <Link href="/goods-in">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="size-4 mr-2" />
                  Record Goods In
                </Button>
              </Link>
              <Link href="/goods-out">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingCart className="size-4 mr-2" />
                  Record Goods Out
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Financial overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total Sales (Goods Out)
                </span>
                <span className="font-medium">₹{totalGoodsOut.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total Purchases (Goods In)
                </span>
                <span className="font-medium">₹{totalGoodsIn.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Net Profit</span>
                <span className="font-bold">
                  ₹{(totalGoodsOut - totalGoodsIn).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Payments Received</span>
                <span className="font-medium text-green-600">
                  ₹{totalPaymentsIn.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payments Made</span>
                <span className="font-medium text-red-600">
                  ₹{totalPaymentsOut.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
