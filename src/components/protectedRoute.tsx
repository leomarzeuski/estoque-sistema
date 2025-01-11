"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/login") return;

    if (!user) {
      router.push("/login");
    }
  }, [user, router, pathname]);

  if (!user && pathname !== "/login") {
    return <p>Carregando...</p>;
  }

  return <>{children}</>;
}
