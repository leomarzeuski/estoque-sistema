"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const sair = () => {
    logout();
    router.push("/login");
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={sair}>
        <LogOut />
        <span>Sair</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
