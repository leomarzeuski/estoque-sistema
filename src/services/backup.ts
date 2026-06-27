/**
 * Backup dos dados: exportar para um arquivo e restaurar de um arquivo.
 *
 * Como os dados ficam só no aparelho, o backup é a forma de não perder tudo
 * (e de levar os dados de um aparelho para outro manualmente).
 */

import { read, write } from "@/lib/db";
import { PRODUTOS_KEY } from "./produtos";
import { MOVIMENTACOES_KEY } from "./movimentacoes";
import type { Produto, Movimentacao } from "@/types";

const VERSAO_BACKUP = 1;

interface Backup {
  app: "meu-estoque";
  versao: number;
  exportadoEm: string;
  produtos: Produto[];
  movimentacoes: Movimentacao[];
}

/** Monta o objeto de backup com todos os dados atuais. */
export function gerarBackup(): Backup {
  return {
    app: "meu-estoque",
    versao: VERSAO_BACKUP,
    exportadoEm: new Date().toISOString(),
    produtos: read<Produto>(PRODUTOS_KEY),
    movimentacoes: read<Movimentacao>(MOVIMENTACOES_KEY),
  };
}

/** Baixa um arquivo .json com o backup completo. */
export function baixarBackup(): void {
  if (typeof window === "undefined") return;
  const conteudo = JSON.stringify(gerarBackup(), null, 2);
  const blob = new Blob([conteudo], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const data = new Date().toISOString().slice(0, 10);

  const link = document.createElement("a");
  link.href = url;
  link.download = `meu-estoque-backup-${data}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export type ResultadoRestauracao =
  | { ok: true; produtos: number; movimentacoes: number }
  | { ok: false; erro: string };

/**
 * Restaura os dados a partir do conteúdo de um arquivo de backup.
 * ATENÇÃO: substitui completamente os dados atuais.
 */
export function restaurarBackup(conteudo: string): ResultadoRestauracao {
  let dados: Partial<Backup>;
  try {
    dados = JSON.parse(conteudo);
  } catch {
    return { ok: false, erro: "Não foi possível ler o arquivo (formato inválido)." };
  }

  if (
    !dados ||
    typeof dados !== "object" ||
    !Array.isArray(dados.produtos) ||
    !Array.isArray(dados.movimentacoes)
  ) {
    return {
      ok: false,
      erro: "Este arquivo não parece ser um backup do Meu Estoque.",
    };
  }

  write<Produto>(PRODUTOS_KEY, dados.produtos as Produto[]);
  write<Movimentacao>(MOVIMENTACOES_KEY, dados.movimentacoes as Movimentacao[]);

  return {
    ok: true,
    produtos: dados.produtos.length,
    movimentacoes: dados.movimentacoes.length,
  };
}
