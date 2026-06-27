/**
 * Registro de vendas: guarda para quem, quando, o quê e por quanto, e dá
 * baixa no estoque com o preço realmente praticado.
 */

import { read, write, uid } from "@/lib/db";
import { registrarSaida } from "./produtos";
import type { Venda, VendaItem } from "@/types";

export const VENDAS_KEY = "vendas";

export function listarVendas(): Venda[] {
  return [...read<Venda>(VENDAS_KEY)].sort((a, b) =>
    b.data.localeCompare(a.data)
  );
}

export interface VendaInput {
  clienteId?: string;
  clienteNome: string;
  itens: VendaItem[];
  pago: boolean;
}

/** Registra a venda e baixa o estoque de cada item pelo preço efetivo. */
export function registrarVenda(input: VendaInput): Venda {
  const total = input.itens.reduce((soma, i) => soma + i.subtotal, 0);
  const venda: Venda = {
    id: uid(),
    data: new Date().toISOString(),
    clienteId: input.clienteId,
    clienteNome: input.clienteNome,
    itens: input.itens,
    total,
    pago: input.pago,
  };
  write<Venda>(VENDAS_KEY, [venda, ...read<Venda>(VENDAS_KEY)]);

  const temCliente =
    input.clienteNome && input.clienteNome !== "Cliente avulso";
  for (const item of input.itens) {
    const precoEfetivo =
      item.quantidade > 0 ? item.subtotal / item.quantidade : item.precoUnitario;
    registrarSaida(
      item.produtoId,
      item.quantidade,
      temCliente ? `Venda - ${input.clienteNome}` : "Venda",
      precoEfetivo
    );
  }

  return venda;
}

/** Marca uma venda fiada como paga. */
export function marcarPago(id: string): void {
  const vendas = read<Venda>(VENDAS_KEY);
  const indice = vendas.findIndex((v) => v.id === id);
  if (indice === -1) return;
  const novas = [...vendas];
  novas[indice] = { ...novas[indice], pago: true };
  write<Venda>(VENDAS_KEY, novas);
}
