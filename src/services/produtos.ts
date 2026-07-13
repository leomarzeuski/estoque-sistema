/**
 * Operações de produtos e de estoque.
 *
 * Toda alteração de quantidade passa por aqui e gera um registro no
 * histórico de movimentações, mantendo o estoque sempre rastreável.
 */

import { read, write, uid } from "@/lib/db";
import type { Produto, TipoMovimentacao, Movimentacao } from "@/types";

import {
  appendMovimentacao,
  removerMovimentacao,
  removerMovimentacoesDoProduto,
} from "./movimentacoes";

export const PRODUTOS_KEY = "produtos";

/** Dados informados nos formulários de cadastro/edição. */
export interface ProdutoInput {
  nome: string;
  categoria: string;
  unidade: string;
  precoCusto: number;
  precoVenda: number;
  quantidade: number;
  estoqueMinimo: number;
  fornecedor?: string;
  observacao?: string;
  unidadeVenda?: string;
  fatorConversao?: number;
}

export function listarProdutos(): Produto[] {
  return read<Produto>(PRODUTOS_KEY);
}

export function obterProduto(id: string): Produto | undefined {
  return read<Produto>(PRODUTOS_KEY).find((p) => p.id === id);
}

/** Cadastra um novo produto. Se houver quantidade inicial, registra a entrada. */
export function criarProduto(input: ProdutoInput): Produto {
  const agora = new Date().toISOString();
  const produto: Produto = {
    id: uid(),
    nome: input.nome.trim(),
    categoria: input.categoria,
    unidade: input.unidade,
    precoCusto: input.precoCusto,
    precoVenda: input.precoVenda,
    quantidade: input.quantidade,
    estoqueMinimo: input.estoqueMinimo,
    fornecedor: input.fornecedor?.trim() || undefined,
    observacao: input.observacao?.trim() || undefined,
    unidadeVenda: input.unidadeVenda || undefined,
    fatorConversao: input.fatorConversao || undefined,
    criadoEm: agora,
    atualizadoEm: agora,
  };

  write<Produto>(PRODUTOS_KEY, [produto, ...read<Produto>(PRODUTOS_KEY)]);

  if (input.quantidade > 0) {
    appendMovimentacao({
      produtoId: produto.id,
      produtoNome: produto.nome,
      tipo: "entrada",
      quantidade: input.quantidade,
      estoqueAntes: 0,
      estoqueDepois: input.quantidade,
      motivo: "Estoque inicial",
    });
  }

  return produto;
}

/**
 * Atualiza os dados cadastrais do produto.
 * A quantidade NÃO é alterada aqui — ela só muda por entrada/saída/ajuste.
 */
export function atualizarProduto(
  id: string,
  input: ProdutoInput
): Produto | undefined {
  const produtos = read<Produto>(PRODUTOS_KEY);
  const indice = produtos.findIndex((p) => p.id === id);
  if (indice === -1) return undefined;

  const atualizado: Produto = {
    ...produtos[indice],
    nome: input.nome.trim(),
    categoria: input.categoria,
    unidade: input.unidade,
    precoCusto: input.precoCusto,
    precoVenda: input.precoVenda,
    estoqueMinimo: input.estoqueMinimo,
    fornecedor: input.fornecedor?.trim() || undefined,
    observacao: input.observacao?.trim() || undefined,
    unidadeVenda: input.unidadeVenda || undefined,
    fatorConversao: input.fatorConversao || undefined,
    atualizadoEm: new Date().toISOString(),
  };

  const novos = [...produtos];
  novos[indice] = atualizado;
  write<Produto>(PRODUTOS_KEY, novos);
  return atualizado;
}

/** Marca/desmarca o produto como favorito. */
export function alternarFavorito(id: string): void {
  const produtos = read<Produto>(PRODUTOS_KEY);
  const indice = produtos.findIndex((p) => p.id === id);
  if (indice === -1) return;
  const novos = [...produtos];
  novos[indice] = {
    ...novos[indice],
    favorito: !novos[indice].favorito,
    atualizadoEm: new Date().toISOString(),
  };
  write<Produto>(PRODUTOS_KEY, novos);
}

/** Arquiva/desarquiva o produto (sai das listas, mas mantém o histórico). */
export function alternarArquivado(id: string): void {
  const produtos = read<Produto>(PRODUTOS_KEY);
  const indice = produtos.findIndex((p) => p.id === id);
  if (indice === -1) return;
  const novos = [...produtos];
  novos[indice] = {
    ...novos[indice],
    arquivado: !novos[indice].arquivado,
    atualizadoEm: new Date().toISOString(),
  };
  write<Produto>(PRODUTOS_KEY, novos);
}

/** Remove o produto e todo o seu histórico de movimentações. */
export function removerProduto(id: string): void {
  write<Produto>(
    PRODUTOS_KEY,
    read<Produto>(PRODUTOS_KEY).filter((p) => p.id !== id)
  );
  removerMovimentacoesDoProduto(id);
}

/**
 * Aplica uma variação de estoque e registra a movimentação.
 * `delta` é a variação assinada (positiva entra, negativa sai).
 * `quantidadeRegistro` é o valor exibido no histórico (sempre positivo).
 */
function aplicarMovimentacao(
  id: string,
  tipo: TipoMovimentacao,
  delta: number,
  quantidadeRegistro: number,
  motivo?: string,
  valorUnitario?: number
): Movimentacao | undefined {
  const produtos = read<Produto>(PRODUTOS_KEY);
  const indice = produtos.findIndex((p) => p.id === id);
  if (indice === -1) return undefined;

  const anterior = produtos[indice];
  const estoqueAntes = anterior.quantidade;
  const estoqueDepois = Math.max(0, estoqueAntes + delta);

  const atualizado: Produto = {
    ...anterior,
    quantidade: estoqueDepois,
    atualizadoEm: new Date().toISOString(),
  };
  const novos = [...produtos];
  novos[indice] = atualizado;
  write<Produto>(PRODUTOS_KEY, novos);

  return appendMovimentacao({
    produtoId: id,
    produtoNome: anterior.nome,
    tipo,
    quantidade: quantidadeRegistro,
    estoqueAntes,
    estoqueDepois,
    motivo: motivo?.trim() || undefined,
    valorUnitario,
  });
}

/** Registra a chegada de mercadoria (aumenta o estoque). */
export function registrarEntrada(
  id: string,
  quantidade: number,
  motivo?: string
): Movimentacao | undefined {
  const qtd = Math.abs(quantidade);
  return aplicarMovimentacao(id, "entrada", qtd, qtd, motivo);
}

/**
 * Registra a saída de mercadoria (diminui o estoque).
 * `valorUnitario` (opcional) guarda o preço de venda no momento, para faturamento.
 */
export function registrarSaida(
  id: string,
  quantidade: number,
  motivo?: string,
  valorUnitario?: number
): Movimentacao | undefined {
  const qtd = Math.abs(quantidade);
  return aplicarMovimentacao(id, "saida", -qtd, qtd, motivo, valorUnitario);
}

/** Corrige o estoque para um valor exato (contagem física). */
export function ajustarEstoque(
  id: string,
  novaQuantidade: number,
  motivo?: string
): Movimentacao | undefined {
  const produto = obterProduto(id);
  if (!produto) return undefined;
  const alvo = Math.max(0, novaQuantidade);
  const delta = alvo - produto.quantidade;
  return aplicarMovimentacao(
    id,
    "ajuste",
    delta,
    Math.abs(delta),
    motivo || "Ajuste por contagem"
  );
}

/**
 * Desfaz uma movimentação: reverte o efeito dela no estoque e apaga o
 * registro do histórico. Pensado para o "Desfazer" logo após a ação.
 */
export function desfazerMovimentacao(mov: Movimentacao): void {
  const produtos = read<Produto>(PRODUTOS_KEY);
  const indice = produtos.findIndex((p) => p.id === mov.produtoId);
  if (indice !== -1) {
    const atual = produtos[indice];
    const efeito = mov.estoqueDepois - mov.estoqueAntes;
    const novos = [...produtos];
    novos[indice] = {
      ...atual,
      quantidade: Math.max(0, atual.quantidade - efeito),
      atualizadoEm: new Date().toISOString(),
    };
    write<Produto>(PRODUTOS_KEY, novos);
  }
  removerMovimentacao(mov.id);
}
