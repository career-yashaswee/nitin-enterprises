import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { NuqsProvider } from "@/lib/providers/nuqs-provider";
import { NetworkStatusProvider } from "@/lib/providers/network-status-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/providers/theme-provider";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nitin Enterprises - Inventory Management",
  description: "ABAC Inventory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsProvider>
            <QueryProvider>
              {children}
              <Toaster richColors />
              <NetworkStatusProvider />
            </QueryProvider>
          </NuqsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
