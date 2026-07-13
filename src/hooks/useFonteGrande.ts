"use client";

import { useEffect, useState } from "react";

const KEY = "estoque:fonte-grande";

/**
 * Liga/desliga o modo "fonte grande" (acessibilidade), persistindo a escolha
 * e aplicando a classe no `<html>`, que escala toda a interface.
 */
export function useFonteGrande(): [boolean, (valor: boolean) => void] {
  const [grande, setGrande] = useState(false);

  useEffect(() => {
    try {
      setGrande(localStorage.getItem(KEY) === "1");
    } catch {
      // ignora
    }
  }, []);

  const definir = (valor: boolean) => {
    setGrande(valor);
    try {
      if (valor) localStorage.setItem(KEY, "1");
      else localStorage.removeItem(KEY);
    } catch {
      // ignora
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("fonte-grande", valor);
    }
  };

  return [grande, definir];
}
