/** Funções de formatação no padrão brasileiro (moeda, número e datas). */

/** Formata um valor como moeda brasileira, ex: 1234.5 -> "R$ 1.234,50". */
export function formatarMoeda(valor: number): string {
  return (valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata um número no padrão brasileiro, ex: 1234.5 -> "1.234,5". */
export function formatarNumero(valor: number): string {
  return (valor || 0).toLocaleString("pt-BR");
}

/** Formata uma data ISO como "dd/mm/aaaa". */
export function formatarData(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Formata uma data ISO como "dd/mm/aaaa hh:mm". */
export function formatarDataHora(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
