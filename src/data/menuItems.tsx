import { Home, ShoppingCart, History, Settings } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const NavItems: NavItem[] = [
  { title: "Estoque", url: "/", icon: Home },
  { title: "Venda", url: "/venda", icon: ShoppingCart },
  { title: "Histórico", url: "/historico", icon: History },
  { title: "Ajustes", url: "/configuracoes", icon: Settings },
];
