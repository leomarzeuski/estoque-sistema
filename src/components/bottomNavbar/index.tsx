"use client";

import { NavItems } from "@/data/menuItems";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white md:hidden">
      <nav className="flex justify-between">
        {NavItems.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex flex-col items-center justify-center w-full py-2 hover:bg-gray-50 ${
                active ? "text-blue-600 font-semibold" : "text-gray-600"
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
