/**
 * Histórico de movimentações de estoque (entradas, saídas e ajustes).
 *
 * Este módulo só lê e grava o histórico; quem altera a quantidade dos
 * produtos é o `services/produtos.ts` (que chama `appendMovimentacao`).
 */

import { read, write, uid } from "@/lib/db";
import type { Movimentacao } from "@/types";

export const MOVIMENTACOES_KEY = "movimentacoes";

/**
 * Lista as movimentações da mais recente para a mais antiga.
 * Se `produtoId` for informado, traz só as daquele produto.
 */
export function listarMovimentacoes(produtoId?: string): Movimentacao[] {
  const todas = [...read<Movimentacao>(MOVIMENTACOES_KEY)].sort((a, b) =>
    b.data.localeCompare(a.data)
  );
  return produtoId ? todas.filter((m) => m.produtoId === produtoId) : todas;
}

/** Grava uma nova movimentação no histórico. */
export function appendMovimentacao(
  dados: Omit<Movimentacao, "id" | "data"> & { data?: string }
): Movimentacao {
  const registro: Movimentacao = {
    ...dados,
    id: uid(),
    data: dados.data ?? new Date().toISOString(),
  };
  write<Movimentacao>(MOVIMENTACOES_KEY, [
    registro,
    ...read<Movimentacao>(MOVIMENTACOES_KEY),
  ]);
  return registro;
}

/** Remove do histórico todas as movimentações de um produto. */
export function removerMovimentacoesDoProduto(produtoId: string): void {
  write<Movimentacao>(
    MOVIMENTACOES_KEY,
    read<Movimentacao>(MOVIMENTACOES_KEY).filter(
      (m) => m.produtoId !== produtoId
    )
  );
}
