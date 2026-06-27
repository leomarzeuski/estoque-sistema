/**
 * Tipos de domínio do sistema de estoque.
 *
 * O sistema é pensado para um comerciante de hortifruti do CEAGESP: ele
 * cadastra os produtos que revende, controla quanto tem de cada um e
 * registra as entradas (mercadoria que chega) e saídas (mercadoria que sai).
 */

/** Um produto do catálogo, com seu estoque atual. */
export interface Produto {
  id: string;
  /** Nome do produto, ex: "Tomate", "Banana Prata". */
  nome: string;
  /** Categoria para organização, ex: "Fruta", "Verdura". Ver `CATEGORIAS`. */
  categoria: string;
  /** Como o estoque é contado, ex: "caixa", "saco", "kg". Ver `UNIDADES`. */
  unidade: string;
  /** Quanto custou para comprar (por unidade). */
  precoCusto: number;
  /** Por quanto é revendido (por unidade). */
  precoVenda: number;
  /** Quantidade atual em estoque. Só muda via movimentações. */
  quantidade: number;
  /** Quando atingir esse valor ou menos, o produto entra em "estoque baixo". */
  estoqueMinimo: number;
  /** Fornecedor / box de origem (opcional). */
  fornecedor?: string;
  /** Marcado como favorito (aparece no topo da lista). */
  favorito?: boolean;
  /** Arquivado: sai das listas do dia a dia, mas mantém o histórico. */
  arquivado?: boolean;
  /** Anotações livres (opcional). */
  observacao?: string;
  /** Data de criação (ISO 8601). */
  criadoEm: string;
  /** Data da última alteração (ISO 8601). */
  atualizadoEm: string;
}

/** Sentido de uma movimentação de estoque. */
export type TipoMovimentacao = "entrada" | "saida" | "ajuste";

/**
 * Registro histórico de toda alteração de quantidade de um produto.
 * Guarda um "retrato" do nome do produto e do estoque antes/depois, para
 * que o histórico continue legível mesmo se o produto for editado ou removido.
 */
export interface Movimentacao {
  id: string;
  produtoId: string;
  produtoNome: string;
  tipo: TipoMovimentacao;
  /** Quantidade movimentada (sempre positiva; o `tipo` define o sentido). */
  quantidade: number;
  estoqueAntes: number;
  estoqueDepois: number;
  /** Motivo opcional, ex: "Compra no box 42", "Venda", "Perda". */
  motivo?: string;
  /** Preço de venda unitário no momento (só em saídas/vendas), para faturamento. */
  valorUnitario?: number;
  /** Data/hora da movimentação (ISO 8601). */
  data: string;
}

/** Cliente para quem se vende (opcional em cada venda). */
export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  observacao?: string;
  criadoEm: string;
}

export type DescontoTipo = "R$" | "%";

/** Um item dentro de uma venda, com o preço praticado e o desconto. */
export interface VendaItem {
  produtoId: string;
  nome: string;
  unidade: string;
  quantidade: number;
  /** Preço unitário praticado nesta venda (o preço é volátil, muda por dia). */
  precoUnitario: number;
  desconto: number;
  descontoTipo: DescontoTipo;
  /** (precoUnitario x quantidade) menos o desconto. */
  subtotal: number;
}

/** Uma venda registrada: para quem, quando, o quê e por quanto. */
export interface Venda {
  id: string;
  data: string;
  clienteId?: string;
  /** Nome do cliente no momento (ou "Cliente avulso"). */
  clienteNome: string;
  itens: VendaItem[];
  total: number;
}
