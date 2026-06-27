/**
 * Listas fixas usadas nos formulários (categorias e unidades de medida).
 * Pensadas para o dia a dia de um comerciante de hortifruti do CEAGESP.
 */

export const CATEGORIAS = [
  "Fruta",
  "Verdura",
  "Legume",
  "Tempero",
  "Ovos",
  "Outros",
] as const;

export interface Unidade {
  id: string;
  /** Texto curto exibido em listas, ex: "cx". */
  abreviacao: string;
  /** Texto completo exibido nos formulários, ex: "Caixa". */
  nome: string;
}

export const UNIDADES: Unidade[] = [
  { id: "caixa", abreviacao: "cx", nome: "Caixa" },
  { id: "engradado", abreviacao: "engr", nome: "Engradado" },
  { id: "saco", abreviacao: "sc", nome: "Saco" },
  { id: "duzia", abreviacao: "dz", nome: "Dúzia" },
  { id: "bandeja", abreviacao: "bdj", nome: "Bandeja" },
  { id: "kg", abreviacao: "kg", nome: "Quilo (kg)" },
  { id: "unidade", abreviacao: "un", nome: "Unidade" },
];

/** Retorna a abreviação de uma unidade (ex: "caixa" -> "cx"). */
export function abreviacaoUnidade(unidadeId: string): string {
  return UNIDADES.find((u) => u.id === unidadeId)?.abreviacao ?? unidadeId;
}

/** Retorna o nome completo de uma unidade (ex: "caixa" -> "Caixa"). */
export function nomeUnidade(unidadeId: string): string {
  return UNIDADES.find((u) => u.id === unidadeId)?.nome ?? unidadeId;
}
