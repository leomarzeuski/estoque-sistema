import { Home } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const NavItems: NavItem[] = [{ title: "Pedidos", url: "/", icon: Home }];
