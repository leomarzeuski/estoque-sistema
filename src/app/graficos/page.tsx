"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useProdutos } from "@/hooks/useProdutos";
import { useHydrated } from "@/hooks/useHydrated";
import { valorEmEstoque } from "@/lib/estoque";
import { formatarMoeda, formatarNumero } from "@/lib/format";

const DIA = 86_400_000;

export default function GraficosPage() {
  const movimentacoes = useMovimentacoes();
  const produtos = useProdutos();
  const hydrated = useHydrated();

  const valorPorCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of produtos) {
      if (p.arquivado) continue;
      mapa.set(p.categoria, (mapa.get(p.categoria) ?? 0) + valorEmEstoque(p));
    }
    return [...mapa.entries()]
      .map(([nome, valor]) => ({ nome, valor }))
      .filter((x) => x.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [produtos]);

  const maisVendidos = useMemo(() => {
    const corte = Date.now() - 30 * DIA;
    const mapa = new Map<string, number>();
    for (const m of movimentacoes) {
      if (m.tipo === "saida" && new Date(m.data).getTime() >= corte) {
        mapa.set(m.produtoNome, (mapa.get(m.produtoNome) ?? 0) + m.quantidade);
      }
    }
    return [...mapa.entries()]
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 6);
  }, [movimentacoes]);

  const vendasPorDia = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoje.getTime() - (6 - i) * DIA);
      return {
        dia: d
          .toLocaleDateString("pt-BR", { weekday: "short" })
          .replace(".", ""),
        ts: d.getTime(),
        valor: 0,
      };
    });
    for (const m of movimentacoes) {
      if (m.tipo !== "saida") continue;
      const t = new Date(m.data);
      t.setHours(0, 0, 0, 0);
      const slot = dias.find((x) => x.ts === t.getTime());
      if (slot) slot.valor += m.quantidade * (m.valorUnitario ?? 0);
    }
    return dias;
  }, [movimentacoes]);

  const temDados =
    maisVendidos.length > 0 ||
    vendasPorDia.some((d) => d.valor > 0) ||
    valorPorCategoria.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <PageHeader titulo="Gráficos" voltarHref="/historico" />

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {!hydrated ? (
          <p className="py-10 text-center text-gray-400">Carregando...</p>
        ) : !temDados ? (
          <MensagemEstado
            icone={<TrendingUp className="size-12" />}
            titulo="Ainda sem dados"
            descricao="Registre algumas vendas (em Venda) para ver os gráficos."
          />
        ) : (
          <>
            <section className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-900">
                Vendas dos últimos 7 dias
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={vendasPorDia}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <XAxis
                    dataKey="dia"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v) => `R$ ${v}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatarMoeda(Number(value)),
                      "Vendido",
                    ]}
                  />
                  <Bar
                    dataKey="valor"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-900">
                Mais vendidos (30 dias)
              </h2>
              {maisVendidos.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  Sem saídas no período.
                </p>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(160, maisVendidos.length * 44)}
                >
                  <BarChart
                    data={maisVendidos}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      width={96}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [formatarNumero(Number(value)), "Saiu"]}
                    />
                    <Bar
                      dataKey="qtd"
                      fill="#2563eb"
                      radius={[0, 6, 6, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            {valorPorCategoria.length > 0 && (
              <section className="rounded-xl border bg-white p-4 shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-900">
                  Valor em estoque por categoria
                </h2>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(160, valorPorCategoria.length * 44)}
                >
                  <BarChart
                    data={valorPorCategoria}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      width={96}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatarMoeda(Number(value)),
                        "Valor",
                      ]}
                    />
                    <Bar
                      dataKey="valor"
                      fill="#16a34a"
                      radius={[0, 6, 6, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
