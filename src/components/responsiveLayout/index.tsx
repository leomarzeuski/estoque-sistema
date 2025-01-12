"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navbar";

import { MobileBottomNav } from "../bottomNavbar";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const pathname = usePathname();
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent) {
      setIsWeb(!/Mobi|Android/i.test(navigator.userAgent));
    }
  }, []);

  if (pathname === "/login") {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <SidebarProvider>
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <div className="md:hidden">
        <MobileBottomNav />
      </div>

      {isWeb && <SidebarTrigger />}

      <main className="flex-1">{children}</main>
    </SidebarProvider>
  );
}
