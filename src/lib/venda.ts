import type { DescontoTipo } from "@/types";

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
