"use client";

import { ArrowDownCircle, ArrowUpCircle, SlidersHorizontal } from "lucide-react";

import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { formatarDataHora, formatarNumero } from "@/lib/format";
import { abreviacaoUnidade } from "@/data/catalogo";
import type { TipoMovimentacao } from "@/types";

const ESTILO: Record<
  TipoMovimentacao,
  { rotulo: string; icone: React.ReactNode; cor: string; sinal: string }
> = {
  entrada: {
    rotulo: "Entrada",
    icone: <ArrowUpCircle className="size-6 text-green-600" />,
    cor: "text-green-700",
    sinal: "+",
  },
  saida: {
    rotulo: "Saída",
    icone: <ArrowDownCircle className="size-6 text-red-600" />,
    cor: "text-red-700",
    sinal: "−",
  },
  ajuste: {
    rotulo: "Ajuste",
    icone: <SlidersHorizontal className="size-5 text-gray-500" />,
    cor: "text-gray-700",
    sinal: "",
  },
};

export function HistoricoMovimentacoes({
  produtoId,
  unidade,
}: {
  produtoId: string;
  unidade: string;
}) {
  const movimentacoes = useMovimentacoes(produtoId);
  const un = abreviacaoUnidade(unidade);

  if (movimentacoes.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        Nenhuma movimentação ainda.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {movimentacoes.map((m) => {
        const estilo = ESTILO[m.tipo];
        return (
          <li key={m.id} className="flex items-center gap-3 py-3">
            <span className="shrink-0">{estilo.icone}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{estilo.rotulo}</p>
              {m.motivo && (
                <p className="truncate text-sm text-gray-500">{m.motivo}</p>
              )}
              <p className="text-xs text-gray-400">
                {formatarDataHora(m.data)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {m.tipo !== "ajuste" && (
                <p className={`font-semibold ${estilo.cor}`}>
                  {estilo.sinal}
                  {formatarNumero(m.quantidade)} {un}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {formatarNumero(m.estoqueAntes)} → {formatarNumero(m.estoqueDepois)} {un}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
