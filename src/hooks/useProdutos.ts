import { useMemo } from "react";

import { useCollection } from "./useCollection";
import { PRODUTOS_KEY } from "@/services/produtos";
import type { Produto } from "@/types";

/** Lista reativa de todos os produtos, ordenados por nome. */
export function useProdutos(): Produto[] {
  const produtos = useCollection<Produto>(PRODUTOS_KEY);
  return useMemo(
    () => [...produtos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [produtos]
  );
}

/** Um único produto, reativo. */
export function useProduto(id: string | undefined): Produto | undefined {
  const produtos = useCollection<Produto>(PRODUTOS_KEY);
  return useMemo(
    () => (id ? produtos.find((p) => p.id === id) : undefined),
    [produtos, id]
  );
}
