import type { DescontoTipo, Venda } from "@/types";

/** Calcula o subtotal de um item: (preço x quantidade) menos o desconto. */
export function calcularSubtotal(
  preco: number,
  quantidade: number,
  desconto: number,
  tipo: DescontoTipo
): number {
  const bruto = (preco || 0) * (quantidade || 0);
  const abatimento =
    tipo === "%" ? (bruto * (desconto || 0)) / 100 : desconto || 0;
  return Math.max(0, bruto - abatimento);
}

/** Lucro de uma venda: total recebido menos o custo da mercadoria vendida. */
export function lucroVenda(venda: Venda): number {
  const custo = venda.itens.reduce(
    (soma, i) =>
      soma + (i.quantidadeEstoque ?? i.quantidade) * (i.custoUnitario ?? 0),
    0
  );
  return venda.total - custo;
}
