"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Minus,
  Plus,
  ShoppingCart,
  X,
  UserPlus,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProdutos } from "@/hooks/useProdutos";
import { useClientes } from "@/hooks/useClientes";
import { useHydrated } from "@/hooks/useHydrated";
import { registrarVenda } from "@/services/vendas";
import { criarCliente } from "@/services/clientes";
import { baixarReciboVenda } from "@/services/relatorios";
import { calcularSubtotal } from "@/lib/venda";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { abreviacaoUnidade } from "@/data/catalogo";
import type { DescontoTipo, VendaItem } from "@/types";

interface ItemCarrinho {
  produtoId: string;
  nome: string;
  unidade: string;
  estoque: number;
  quantidade: number;
  preco: number;
  desconto: number;
  descontoTipo: DescontoTipo;
}

const campo =
  "h-10 w-full rounded-md border border-input bg-background px-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function VendaPage() {
  const produtos = useProdutos();
  const clientes = useClientes();
  const hydrated = useHydrated();

  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [mostrarNovoCliente, setMostrarNovoCliente] = useState(false);
  const [nomeNovoCliente, setNomeNovoCliente] = useState("");

  const resultados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [];
    return produtos
      .filter(
        (p) =>
          !p.arquivado &&
          p.quantidade > 0 &&
          p.nome.toLowerCase().includes(termo)
      )
      .slice(0, 6);
  }, [produtos, busca]);

  const total = itens.reduce(
    (soma, i) =>
      soma + calcularSubtotal(i.preco, i.quantidade, i.desconto, i.descontoTipo),
    0
  );

  const adicionar = (produtoId: string) => {
    const p = produtos.find((x) => x.id === produtoId);
    if (!p) return;
    setItens((prev) => {
      const existe = prev.find((i) => i.produtoId === produtoId);
      if (existe) {
        return prev.map((i) =>
          i.produtoId === produtoId
            ? { ...i, quantidade: Math.min(i.estoque, i.quantidade + 1) }
            : i
        );
      }
      return [
        ...prev,
        {
          produtoId: p.id,
          nome: p.nome,
          unidade: p.unidade,
          estoque: p.quantidade,
          quantidade: 1,
          preco: p.precoVenda,
          desconto: 0,
          descontoTipo: "R$" as DescontoTipo,
        },
      ];
    });
    setBusca("");
  };

  const atualizar = (produtoId: string, mudanca: Partial<ItemCarrinho>) =>
    setItens((prev) =>
      prev.map((i) => (i.produtoId === produtoId ? { ...i, ...mudanca } : i))
    );

  const mudarQtd = (produtoId: string, delta: number) =>
    setItens((prev) =>
      prev.map((i) =>
        i.produtoId === produtoId
          ? {
              ...i,
              quantidade: Math.max(1, Math.min(i.estoque, i.quantidade + delta)),
            }
          : i
      )
    );

  const remover = (produtoId: string) =>
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId));

  const criarNovoCliente = () => {
    const nome = nomeNovoCliente.trim();
    if (!nome) return;
    const cliente = criarCliente({ nome });
    setClienteId(cliente.id);
    setNomeNovoCliente("");
    setMostrarNovoCliente(false);
    toast.success(`Cliente "${cliente.nome}" adicionado.`);
  };

  const finalizar = async () => {
    if (itens.length === 0) return;
    const cliente = clientes.find((c) => c.id === clienteId);
    const vendaItens: VendaItem[] = itens.map((i) => ({
      produtoId: i.produtoId,
      nome: i.nome,
      unidade: i.unidade,
      quantidade: i.quantidade,
      precoUnitario: i.preco,
      desconto: i.desconto,
      descontoTipo: i.descontoTipo,
      subtotal: calcularSubtotal(i.preco, i.quantidade, i.desconto, i.descontoTipo),
    }));
    const venda = registrarVenda({
      clienteId: cliente?.id,
      clienteNome: cliente?.nome ?? "Cliente avulso",
      itens: vendaItens,
    });
    setItens([]);
    setClienteId("");
    toast.success(`Venda de ${formatarMoeda(venda.total)} registrada!`);
    await baixarReciboVenda(venda);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <PageHeader
        titulo="Nova venda"
        voltarHref="/"
        acao={
          <Link
            href="/vendas"
            aria-label="Ver vendas"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          >
            <Receipt size={20} />
          </Link>
        }
      />

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Cliente */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <div className="flex gap-2">
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className={`${campo} h-12 flex-1`}
            >
              <option value="">Cliente avulso</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              className="h-12 shrink-0 gap-2"
              onClick={() => setMostrarNovoCliente((v) => !v)}
            >
              <UserPlus className="size-5" />
            </Button>
          </div>
          {mostrarNovoCliente && (
            <div className="mt-2 flex gap-2">
              <Input
                value={nomeNovoCliente}
                onChange={(e) => setNomeNovoCliente(e.target.value)}
                placeholder="Nome do cliente"
                className="h-11"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0"
                onClick={criarNovoCliente}
              >
                Salvar
              </Button>
            </div>
          )}
        </div>

        {/* Buscar produto para adicionar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-gray-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto para adicionar..."
            className="h-12 pl-10"
          />
          {resultados.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
              {resultados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => adicionar(p.id)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <span className="truncate font-medium text-gray-900">
                    {p.nome}
                  </span>
                  <span className="shrink-0 text-sm text-gray-500">
                    {formatarMoeda(p.precoVenda)} · {formatarNumero(p.quantidade)}{" "}
                    {abreviacaoUnidade(p.unidade)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Carrinho */}
        {itens.length === 0 ? (
          <MensagemEstado
            icone={<ShoppingCart className="size-12" />}
            titulo="Carrinho vazio"
            descricao="Busque um produto acima e toque para adicionar à venda."
          />
        ) : (
          <div className="space-y-3">
            {itens.map((i) => {
              const un = abreviacaoUnidade(i.unidade);
              const subtotal = calcularSubtotal(
                i.preco,
                i.quantidade,
                i.desconto,
                i.descontoTipo
              );
              return (
                <div
                  key={i.produtoId}
                  className="rounded-xl border bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900">{i.nome}</p>
                    <button
                      type="button"
                      onClick={() => remover(i.produtoId)}
                      aria-label="Remover"
                      className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  {/* Quantidade */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="w-16 text-sm text-gray-500">Qtd</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full"
                      onClick={() => mudarQtd(i.produtoId, -1)}
                      aria-label="Diminuir"
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">
                      {formatarNumero(i.quantidade)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full"
                      onClick={() => mudarQtd(i.produtoId, 1)}
                      aria-label="Aumentar"
                    >
                      <Plus className="size-4" />
                    </Button>
                    <span className="text-sm text-gray-400">{un}</span>
                  </div>

                  {/* Preço unitário (volátil) */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="w-16 text-sm text-gray-500">Preço</span>
                    <span className="text-sm text-gray-500">R$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={i.preco}
                      onChange={(e) =>
                        atualizar(i.produtoId, {
                          preco: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`${campo} max-w-[7rem]`}
                    />
                  </div>

                  {/* Desconto */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="w-16 text-sm text-gray-500">Desc.</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={i.desconto}
                      onChange={(e) =>
                        atualizar(i.produtoId, {
                          desconto: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`${campo} max-w-[6rem]`}
                    />
                    <select
                      value={i.descontoTipo}
                      onChange={(e) =>
                        atualizar(i.produtoId, {
                          descontoTipo: e.target.value as DescontoTipo,
                        })
                      }
                      className={`${campo} max-w-[4.5rem]`}
                    >
                      <option value="R$">R$</option>
                      <option value="%">%</option>
                    </select>
                    <span className="ml-auto font-semibold text-gray-900">
                      {formatarMoeda(subtotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!hydrated && (
          <p className="py-4 text-center text-gray-400">Carregando...</p>
        )}
      </div>

      {/* Barra de finalização */}
      {itens.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:bottom-0">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500">
                {clienteId
                  ? clientes.find((c) => c.id === clienteId)?.nome
                  : "Cliente avulso"}
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
