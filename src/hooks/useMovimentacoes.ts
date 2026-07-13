import { useMemo } from "react";

import { useCollection } from "./useCollection";
import { MOVIMENTACOES_KEY } from "@/services/movimentacoes";
import type { Movimentacao } from "@/types";

/**
 * Lista reativa de movimentações, da mais recente para a mais antiga.
 * Se `produtoId` for informado, traz só as daquele produto.
 */
export function useMovimentacoes(produtoId?: string): Movimentacao[] {
  const movimentacoes = useCollection<Movimentacao>(MOVIMENTACOES_KEY);
  return useMemo(() => {
    const ordenadas = [...movimentacoes].sort((a, b) =>
      b.data.localeCompare(a.data)
    );
    return produtoId
      ? ordenadas.filter((m) => m.produtoId === produtoId)
      : ordenadas;
  }, [movimentacoes, produtoId]);
}
