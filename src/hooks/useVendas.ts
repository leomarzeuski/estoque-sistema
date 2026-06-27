import { useMemo } from "react";

import { useCollection } from "./useCollection";
import { VENDAS_KEY } from "@/services/vendas";
import type { Venda } from "@/types";

/** Lista reativa de vendas, da mais recente para a mais antiga. */
export function useVendas(): Venda[] {
  const vendas = useCollection<Venda>(VENDAS_KEY);
  return useMemo(
    () => [...vendas].sort((a, b) => b.data.localeCompare(a.data)),
    [vendas]
  );
}
