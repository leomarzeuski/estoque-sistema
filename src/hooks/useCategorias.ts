import { useMemo } from "react";

import { useCollection } from "./useCollection";
import { CATEGORIAS } from "@/data/catalogo";
import { CATEGORIAS_KEY } from "@/services/categorias";

/** Lista reativa de categorias: as fixas + as criadas pelo usuário. */
export function useCategorias(): string[] {
  const custom = useCollection<string>(CATEGORIAS_KEY);
  return useMemo(
    () => Array.from(new Set([...CATEGORIAS, ...custom])),
    [custom]
  );
}
