import { Home, PackagePlus, Settings } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const NavItems: NavItem[] = [
  { title: "Estoque", url: "/", icon: Home },
  { title: "Novo Produto", url: "/produtos/novo", icon: PackagePlus },
  { title: "Ajustes", url: "/configuracoes", icon: Settings },
];
