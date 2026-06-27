"use client";

import { useMemo, useState } from "react";
import { Search, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProdutos } from "@/hooks/useProdutos";
import { useHydrated } from "@/hooks/useHydrated";
import { registrarSaida } from "@/services/produtos";
import {
  baixarReciboVenda,
  totalVenda,
  type ItemVenda,
} from "@/services/relatorios";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { abreviacaoUnidade } from "@/data/catalogo";

export default function VendaPage() {
  const produtos = useProdutos();
  const hydrated = useHydrated();
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<Record<string, number>>({});

  const disponiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter(
      (p) =>
        !p.arquivado &&
        p.quantidade > 0 &&
        (!termo || p.nome.toLowerCase().includes(termo))
    );
  }, [produtos, busca]);

  const itens: ItemVenda[] = useMemo(
    () =>
      produtos
        .filter((p) => (carrinho[p.id] ?? 0) > 0)
        .map((p) => ({ produto: p, quantidade: carrinho[p.id] })),
    [produtos, carrinho]
  );

  const total = totalVenda(itens);
  const totalItens = itens.reduce((soma, i) => soma + i.quantidade, 0);

  const mudarQtd = (id: string, delta: number, max: number) => {
    setCarrinho((prev) => {
      const novo = Math.min(max, Math.max(0, (prev[id] ?? 0) + delta));
      const atualizado = { ...prev };
      if (novo <= 0) delete atualizado[id];
      else atualizado[id] = novo;
      return atualizado;
    });
  };

  const finalizar = async () => {
    if (itens.length === 0) return;
    const venda = itens;
    const valor = total;
    venda.forEach(({ produto, quantidade }) =>
      registrarSaida(produto.id, quantidade, "Venda", produto.precoVenda)
    );
    setCarrinho({});
    toast.success(`Venda de ${formatarMoeda(valor)} registrada!`);
    await baixarReciboVenda(venda);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <PageHeader titulo="Venda rápida" voltarHref="/" />

      <div className="mx-auto max-w-2xl space-y-3 p-4">
        <p className="text-sm text-gray-500">
          Escolha os produtos e as quantidades. No fim, o estoque baixa sozinho
          e sai um recibo.
        </p>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-gray-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="h-12 pl-10"
          />
        </div>

        {!hydrated ? (
          <p className="py-10 text-center text-gray-400">Carregando...</p>
        ) : disponiveis.length === 0 ? (
          <MensagemEstado
            icone={<ShoppingCart className="size-12" />}
            titulo="Nada para vender"
            descricao="Não há produtos com estoque disponível no momento."
          />
        ) : (
          <div className="space-y-2">
            {disponiveis.map((p) => {
              const un = abreviacaoUnidade(p.unidade);
              const qtd = carrinho[p.id] ?? 0;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm ${
                    qtd > 0 ? "border-primary ring-1 ring-primary" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {p.nome}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatarMoeda(p.precoVenda)} · tem{" "}
                      {formatarNumero(p.quantidade)} {un}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      disabled={qtd <= 0}
                      onClick={() => mudarQtd(p.id, -1, p.quantidade)}
                      aria-label="Tirar um"
                    >
                      <Minus className="size-5" />
                    </Button>
                    <span className="w-7 text-center text-lg font-semibold">
                      {qtd}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-green-200 text-green-700 hover:bg-green-50"
                      disabled={qtd >= p.quantidade}
                      onClick={() => mudarQtd(p.id, 1, p.quantidade)}
                      aria-label="Colocar um"
                    >
                      <Plus className="size-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Barra de finalização */}
      {totalItens > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:bottom-0">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500">
                {formatarNumero(totalItens)} item(ns)
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatarMoeda(total)}
              </p>
            </div>
            <Button
              onClick={finalizar}
              className="h-12 gap-2 bg-green-600 px-6 text-base text-white hover:bg-green-700"
            >
              <ShoppingCart className="size-5" /> Finalizar venda
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
