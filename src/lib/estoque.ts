/** Regras de negócio sobre o estado do estoque de um produto. */

import type { Produto } from "@/types";

export type StatusEstoque = "sem" | "baixo" | "ok";

/** Classifica o estoque do produto em sem estoque / baixo / em estoque. */
export function statusEstoque(produto: Produto): StatusEstoque {
  if (produto.quantidade <= 0) return "sem";
  if (produto.quantidade <= produto.estoqueMinimo) return "baixo";
  return "ok";
}

interface StatusVisual {
  label: string;
  /** Classes Tailwind para badge (fundo + texto + borda). */
  badge: string;
  /** Cor de destaque para o número da quantidade. */
  texto: string;
}

export const STATUS_INFO: Record<StatusEstoque, StatusVisual> = {
  ok: {
    label: "Em estoque",
    badge: "bg-green-100 text-green-800 border border-green-200",
    texto: "text-green-700",
  },
  baixo: {
    label: "Estoque baixo",
    badge: "bg-amber-100 text-amber-900 border border-amber-200",
    texto: "text-amber-700",
  },
  sem: {
    label: "Sem estoque",
    badge: "bg-red-100 text-red-800 border border-red-200",
    texto: "text-red-700",
  },
};

/** Valor do produto parado em estoque (quantidade x preço de custo). */
export function valorEmEstoque(produto: Produto): number {
  return produto.quantidade * (produto.precoCusto || 0);
}

export interface ResumoEstoque {
  totalProdutos: number;
  /** Produtos com estoque baixo ou zerado (precisam de atenção). */
  precisamAtencao: number;
  semEstoque: number;
  /** Valor total parado em estoque (a preço de custo). */
  valorTotal: number;
}

/** Calcula os números do painel a partir da lista de produtos. */
export function calcularResumo(produtos: Produto[]): ResumoEstoque {
  return produtos.reduce<ResumoEstoque>(
    (resumo, produto) => {
      const status = statusEstoque(produto);
      return {
        totalProdutos: resumo.totalProdutos + 1,
        precisamAtencao:
          resumo.precisamAtencao + (status !== "ok" ? 1 : 0),
        semEstoque: resumo.semEstoque + (status === "sem" ? 1 : 0),
        valorTotal: resumo.valorTotal + valorEmEstoque(produto),
      };
    },
    { totalProdutos: 0, precisamAtencao: 0, semEstoque: 0, valorTotal: 0 }
  );
}
