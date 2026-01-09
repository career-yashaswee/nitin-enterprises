"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Package, ShoppingCart } from "@phosphor-icons/react";

const actions = [
  {
    title: "Add New Account",
    icon: Users,
    href: "/accounts",
  },
  {
    title: "Record Goods In",
    icon: Package,
    href: "/goods-in",
  },
  {
    title: "Record Goods Out",
    icon: ShoppingCart,
    href: "/goods-out",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Quick actions to help you get started</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="h-full">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
              >
                <Card className="h-full flex flex-col items-center justify-center p-6 cursor-pointer transition-all">
                  <Icon className="size-8 text-muted-foreground mb-3" />
                  <CardTitle className="text-center text-sm">
                    {action.title}
                  </CardTitle>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
