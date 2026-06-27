"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, User } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { useVendas } from "@/hooks/useVendas";
import { useHydrated } from "@/hooks/useHydrated";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { abreviacaoUnidade } from "@/data/catalogo";
import type { Venda } from "@/types";

const PERIODOS = [
  { id: "hoje", label: "Hoje" },
  { id: "7", label: "7 dias" },
  { id: "30", label: "30 dias" },
  { id: "tudo", label: "Tudo" },
] as const;

type PeriodoId = (typeof PERIODOS)[number]["id"];

function inicioPeriodo(periodo: PeriodoId): number {
  if (periodo === "tudo") return 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (periodo === "7") d.setDate(d.getDate() - 6);
  if (periodo === "30") d.setDate(d.getDate() - 29);
  return d.getTime();
}

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

function resumoItens(venda: Venda): string {
  return venda.itens
    .map(
      (i) =>
        `${i.nome} ${formatarNumero(i.quantidade)}${abreviacaoUnidade(
          i.unidade
        )}`
    )
    .join(" · ");
}

export default function VendasPage() {
  const vendas = useVendas();
  const hydrated = useHydrated();
  const [periodo, setPeriodo] = useState<PeriodoId>("tudo");

  const filtradas = useMemo(() => {
    const corte = inicioPeriodo(periodo);
    return corte === 0
      ? vendas
      : vendas.filter((v) => new Date(v.data).getTime() >= corte);
  }, [vendas, periodo]);

  const totalPeriodo = filtradas.reduce((soma, v) => soma + v.total, 0);

  const porCliente = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const v of filtradas) {
      mapa.set(v.clienteNome, (mapa.get(v.clienteNome) ?? 0) + v.total);
    }
    return [...mapa.entries()]
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filtradas]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, Venda[]>();
    for (const v of filtradas) {
      const dia = new Date(v.data).toDateString();
      const lista = mapa.get(dia);
      if (lista) lista.push(v);
      else mapa.set(dia, [v]);
    }
    return Array.from(mapa.entries());
  }, [filtradas]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <PageHeader titulo="Vendas" voltarHref="/" />

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Período */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                periodo === p.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {!hydrated ? (
          <p className="py-10 text-center text-gray-400">Carregando...</p>
        ) : filtradas.length === 0 ? (
          <MensagemEstado
            icone={<ShoppingCart className="size-12" />}
            titulo="Nenhuma venda no período"
            descricao="As vendas que você finalizar aparecem aqui, com cliente e valor."
          />
        ) : (
          <>
            {/* Resumo */}
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Vendido no período
              </p>
              <p className="text-2xl font-bold text-green-700">
                {formatarMoeda(totalPeriodo)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {formatarNumero(filtradas.length)} venda(s)
              </p>
            </div>

            {/* Por cliente */}
            {porCliente.length > 0 && (
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <h2 className="mb-2 font-semibold text-gray-900">
                  Quem mais comprou
                </h2>
                <ul className="divide-y">
                  {porCliente.map((c) => (
                    <li
                      key={c.nome}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <span className="flex items-center gap-2 truncate text-gray-700">
                        <User className="size-4 shrink-0 text-gray-400" />
                        {c.nome}
                      </span>
                      <span className="shrink-0 font-semibold text-gray-900">
                        {formatarMoeda(c.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lista de vendas por dia */}
            {grupos.map(([dia, lista]) => {
              const totalDia = lista.reduce((s, v) => s + v.total, 0);
              return (
                <section key={dia}>
                  <div className="mb-1 flex items-baseline justify-between px-1">
                    <h2 className="text-sm font-semibold capitalize text-gray-700">
                      {rotuloDia(dia)}
                    </h2>
                    <span className="text-xs font-medium text-green-700">
                      {formatarMoeda(totalDia)}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {lista.map((v) => (
                      <li
                        key={v.id}
                        className="rounded-xl border bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 truncate font-medium text-gray-900">
                            <User className="size-4 shrink-0 text-gray-400" />
                            {v.clienteNome}
                          </span>
                          <span className="shrink-0 font-bold text-green-700">
                            {formatarMoeda(v.total)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {hora(v.data)} · {resumoItens(v)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
