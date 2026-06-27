"use client";

import { useMemo } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  SlidersHorizontal,
  History,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useHydrated } from "@/hooks/useHydrated";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import type { Movimentacao, TipoMovimentacao } from "@/types";

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

function rotuloDia(dataStr: string): string {
  const d = new Date(dataStr);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === hoje.toDateString()) return "Hoje";
  if (d.toDateString() === ontem.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoricoPage() {
  const movimentacoes = useMovimentacoes();
  const hydrated = useHydrated();

  const grupos = useMemo(() => {
    const mapa = new Map<string, Movimentacao[]>();
    for (const m of movimentacoes) {
      const dia = new Date(m.data).toDateString();
      const lista = mapa.get(dia);
      if (lista) lista.push(m);
      else mapa.set(dia, [m]);
    }
    return Array.from(mapa.entries());
  }, [movimentacoes]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <PageHeader titulo="Histórico" voltarHref="/" />

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {!hydrated ? (
          <p className="py-10 text-center text-gray-400">Carregando...</p>
        ) : grupos.length === 0 ? (
          <MensagemEstado
            icone={<History className="size-12" />}
            titulo="Sem movimentações ainda"
            descricao="Quando você registrar entradas e saídas, elas aparecem aqui."
          />
        ) : (
          grupos.map(([dia, lista]) => {
            const vendido = lista
              .filter((m) => m.tipo === "saida")
              .reduce(
                (soma, m) => soma + m.quantidade * (m.valorUnitario ?? 0),
                0
              );
            return (
              <section key={dia}>
                <div className="mb-1 flex items-baseline justify-between px-1">
                  <h2 className="text-sm font-semibold capitalize text-gray-700">
                    {rotuloDia(dia)}
                  </h2>
                  {vendido > 0 && (
                    <span className="text-xs font-medium text-green-700">
                      {formatarMoeda(vendido)} vendidos
                    </span>
                  )}
                </div>
                <ul className="divide-y rounded-xl border bg-white px-3 shadow-sm">
                  {lista.map((m) => {
                    const estilo = ESTILO[m.tipo];
                    return (
                      <li key={m.id} className="flex items-center gap-3 py-3">
                        <span className="shrink-0">{estilo.icone}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">
                            {m.produtoNome}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {estilo.rotulo}
                            {m.motivo ? ` · ${m.motivo}` : ""} · {hora(m.data)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {m.tipo !== "ajuste" && (
                            <p className={`font-semibold ${estilo.cor}`}>
                              {estilo.sinal}
                              {formatarNumero(m.quantidade)}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {formatarNumero(m.estoqueAntes)} →{" "}
                            {formatarNumero(m.estoqueDepois)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
