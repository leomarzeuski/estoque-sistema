"use client";

import { useEffect } from "react";

/**
 * Aplica as preferências salvas (ex: fonte grande) assim que o app carrega,
 * para que valham em todas as telas.
 */
export function AplicarPreferencias() {
  useEffect(() => {
    try {
      if (localStorage.getItem("estoque:fonte-grande") === "1") {
        document.documentElement.classList.add("fonte-grande");
      }
      if (localStorage.getItem("estoque:tema-escuro") === "1") {
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignora
    }
  }, []);

  return null;
}
