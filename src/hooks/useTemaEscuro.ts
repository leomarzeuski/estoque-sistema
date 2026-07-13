"use client";

import { useEffect, useState } from "react";

const KEY = "estoque:tema-escuro";

/**
 * Liga/desliga o tema escuro, persistindo a escolha e alternando a classe
 * `dark` no `<html>` (usada pelo Tailwind e pelas regras do globals.css).
 */
export function useTemaEscuro(): [boolean, (valor: boolean) => void] {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    try {
      setEscuro(localStorage.getItem(KEY) === "1");
    } catch {
      // ignora
    }
  }, []);

  const definir = (valor: boolean) => {
    setEscuro(valor);
    try {
      if (valor) localStorage.setItem(KEY, "1");
      else localStorage.removeItem(KEY);
    } catch {
      // ignora
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", valor);
    }
  };

  return [escuro, definir];
}
