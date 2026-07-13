/** Categorias personalizadas criadas pelo usuário (além das fixas). */

import { read, write } from "@/lib/db";
import { CATEGORIAS } from "@/data/catalogo";

export const CATEGORIAS_KEY = "categorias";

/** Adiciona uma categoria nova, sem repetir as que já existem. */
export function adicionarCategoria(nome: string): void {
  const limpo = nome.trim();
  if (!limpo) return;

  const custom = read<string>(CATEGORIAS_KEY);
  const existentes = [...CATEGORIAS, ...custom].map((c) => c.toLowerCase());
  if (existentes.includes(limpo.toLowerCase())) return;

  write<string>(CATEGORIAS_KEY, [...custom, limpo]);
}
