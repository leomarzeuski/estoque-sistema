/** Cadastro de clientes (para quem se vende). */

import { read, write, uid } from "@/lib/db";
import type { Cliente } from "@/types";

export const CLIENTES_KEY = "clientes";

export function listarClientes(): Cliente[] {
  return read<Cliente>(CLIENTES_KEY);
}

export function obterCliente(id: string): Cliente | undefined {
  return read<Cliente>(CLIENTES_KEY).find((c) => c.id === id);
}

export interface ClienteInput {
  nome: string;
  telefone?: string;
  observacao?: string;
}

export function criarCliente(input: ClienteInput): Cliente {
  const cliente: Cliente = {
    id: uid(),
    nome: input.nome.trim(),
    telefone: input.telefone?.trim() || undefined,
    observacao: input.observacao?.trim() || undefined,
    criadoEm: new Date().toISOString(),
  };
  write<Cliente>(CLIENTES_KEY, [cliente, ...read<Cliente>(CLIENTES_KEY)]);
  return cliente;
}

export function removerCliente(id: string): void {
  write<Cliente>(
    CLIENTES_KEY,
    read<Cliente>(CLIENTES_KEY).filter((c) => c.id !== id)
  );
}
