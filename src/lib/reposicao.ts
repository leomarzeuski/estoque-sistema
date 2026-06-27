/** Lógica da lista de reposição (o que comprar para repor o estoque). */

import type { Produto } from "@/types";
import { statusEstoque } from "./estoque";
import { formatarNumero } from "./format";
import { abreviacaoUnidade } from "@/data/catalogo";

export interface ItemReposicao {
  produto: Produto;
  /** Quantidade sugerida de compra. */
  comprar: number;
}

/** Quanto comprar para voltar ao estoque mínimo (sempre pelo menos 1). */
export function sugestaoCompra(produto: Produto): number {
  const faltam = Math.ceil(produto.estoqueMinimo - produto.quantidade);
  return Math.max(1, faltam);
}

/** Produtos que precisam repor (baixo ou zerado), já com a sugestão de compra. */
export function listaReposicao(produtos: Produto[]): ItemReposicao[] {
  return produtos
    .filter((p) => statusEstoque(p) !== "ok")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .map((produto) => ({ produto, comprar: sugestaoCompra(produto) }));
}

/** Monta um texto pronto para compartilhar (ex: WhatsApp). */
export function textoListaCompras(itens: ItemReposicao[]): string {
  if (itens.length === 0) return "Estoque em dia! Nada para repor. ✅";
  const linhas = itens.map(
    ({ produto, comprar }) =>
      `• ${produto.nome}: ${formatarNumero(comprar)} ${abreviacaoUnidade(
        produto.unidade
      )}`
  );
  return `🛒 Lista de compras\n\n${linhas.join("\n")}\n\n(via Meu Estoque)`;
}
