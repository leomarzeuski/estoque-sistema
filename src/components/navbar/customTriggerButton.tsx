import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function CustomTrigger() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <Button
      variant={"outline"}
      onClick={toggleSidebar}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
    >
      {state === "expanded" ? (
        <ChevronLeft size={20} />
      ) : (
        <ChevronRight size={20} />
      )}

      <span>{state === "expanded" ? "Fechar Menu" : "Abrir Menu"}</span>
    </Button>
  );
}
