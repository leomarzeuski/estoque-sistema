"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  Wallet,
  Search,
  Plus,
  PackagePlus,
  ShoppingCart,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MensagemEstado } from "@/components/MensagemEstado";
import { InstallBanner } from "@/components/InstallBanner";
import { ProdutoCard } from "@/components/produtos/ProdutoCard";
import { ListaReposicaoDrawer } from "@/components/produtos/ListaReposicaoDrawer";
import { useProdutos } from "@/hooks/useProdutos";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuth } from "@/context/AuthContext";
import { calcularResumo, statusEstoque } from "@/lib/estoque";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { popularExemplos } from "@/data/exemplos";
import type { Produto } from "@/types";

const PESO_STATUS = { sem: 0, baixo: 1, ok: 2 } as const;

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function dataDeHoje(): string {
  const texto = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function CardResumo({
  icone,
  valor,
  rotulo,
  cor,
}: {
  icone: React.ReactNode;
  valor: string;
  rotulo: string;
  cor: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <div
        className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full ${cor}`}
      >
        {icone}
      </div>
      <p className="text-lg font-bold leading-tight text-gray-900">{valor}</p>
      <p className="text-[11px] leading-tight text-gray-500">{rotulo}</p>
    </div>
  );
}

export default function EstoquePage() {
  const produtos = useProdutos();
  const movimentacoes = useMovimentacoes();
  const hydrated = useHydrated();
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [ordem, setOrdem] = useState("atencao");

  const resumo = useMemo(() => calcularResumo(produtos), [produtos]);

  const atividadeHoje = useMemo(() => {
    const dia = new Date().toDateString();
    const doDia = movimentacoes.filter(
      (m) => new Date(m.data).toDateString() === dia
    );
    const saidas = doDia.filter((m) => m.tipo === "saida");
    return {
      entradas: doDia.filter((m) => m.tipo === "entrada").length,
      saidas: saidas.length,
      vendido: saidas.reduce(
        (soma, m) => soma + m.quantidade * (m.valorUnitario ?? 0),
        0
      ),
    };
  }, [movimentacoes]);

  const categorias = useMemo(
    () => Array.from(new Set(produtos.map((p) => p.categoria))).sort(),
    [produtos]
  );

  const vendas = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const m of movimentacoes) {
      if (m.tipo === "saida") {
        mapa[m.produtoId] = (mapa[m.produtoId] ?? 0) + m.quantidade;
      }
    }
    return mapa;
  }, [movimentacoes]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = produtos.filter((p) => {
      const achou = !termo || p.nome.toLowerCase().includes(termo);
      const passou =
        filtro === "todos"
          ? true
          : filtro === "atencao"
            ? statusEstoque(p) !== "ok"
            : p.categoria === filtro;
      return achou && passou;
    });

    const porNome = (a: Produto, b: Produto) =>
      a.nome.localeCompare(b.nome, "pt-BR");
    const comparadores: Record<string, (a: Produto, b: Produto) => number> = {
      atencao: (a, b) =>
        PESO_STATUS[statusEstoque(a)] - PESO_STATUS[statusEstoque(b)] ||
        porNome(a, b),
      nome: porNome,
      maior: (a, b) => b.quantidade - a.quantidade || porNome(a, b),
      menor: (a, b) => a.quantidade - b.quantidade || porNome(a, b),
      vendidos: (a, b) =>
        (vendas[b.id] ?? 0) - (vendas[a.id] ?? 0) || porNome(a, b),
    };

    return filtrados.sort(comparadores[ordem] ?? comparadores.atencao);
  }, [produtos, busca, filtro, ordem, vendas]);

  const semProdutos = hydrated && produtos.length === 0;
  const temAtividade =
    atividadeHoje.entradas + atividadeHoje.saidas > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-gray-900">
            {hydrated
              ? `${saudacao()}${user?.nome ? `, ${user.nome}` : ""} 👋`
              : "Meu Estoque"}
          </h1>
          <p className="truncate text-xs text-gray-500">
            {hydrated ? dataDeHoje() : "Carregando..."}
          </p>
        </div>
        <Link href="/produtos/novo" className="hidden md:block">
          <Button className="h-11 gap-2">
            <Plus className="size-5" /> Novo Produto
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <InstallBanner />

        {/* Lista de compras / reposição */}
        {resumo.precisamAtencao > 0 && (
          <ListaReposicaoDrawer produtos={produtos}>
            <button className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <ShoppingCart className="size-6 text-amber-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-900">
                  Repor {formatarNumero(resumo.precisamAtencao)}{" "}
                  {resumo.precisamAtencao === 1 ? "produto" : "produtos"}
                </p>
                <p className="text-xs text-amber-700">
                  Ver a lista de compras e compartilhar
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-amber-700" />
            </button>
          </ListaReposicaoDrawer>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-2">
          <CardResumo
            icone={<Package className="size-4 text-blue-700" />}
            cor="bg-blue-100"
            valor={formatarNumero(resumo.totalProdutos)}
            rotulo="Produtos"
          />
          <CardResumo
            icone={<AlertTriangle className="size-4 text-amber-700" />}
            cor="bg-amber-100"
            valor={formatarNumero(resumo.precisamAtencao)}
            rotulo="Precisam repor"
          />
          <CardResumo
            icone={<Wallet className="size-4 text-green-700" />}
            cor="bg-green-100"
            valor={formatarMoeda(resumo.valorTotal)}
            rotulo="Valor em estoque"
          />
        </div>

        {/* Resumo do dia */}
        {hydrated && temAtividade && (
          <p className="text-center text-xs text-gray-500">
            Hoje: {formatarNumero(atividadeHoje.entradas)} entrada(s) ·{" "}
            {formatarNumero(atividadeHoje.saidas)} saída(s)
            {atividadeHoje.vendido > 0 && (
              <span className="font-medium text-green-700">
                {" "}
                · {formatarMoeda(atividadeHoje.vendido)} vendidos
              </span>
            )}
          </p>
        )}

        {/* Busca */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-gray-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="h-12 pl-10"
          />
        </div>

        {/* Filtros por categoria */}
        {produtos.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <Chip
              ativo={filtro === "todos"}
              onClick={() => setFiltro("todos")}
              texto="Todos"
            />
            {resumo.precisamAtencao > 0 && (
              <Chip
                ativo={filtro === "atencao"}
                onClick={() => setFiltro("atencao")}
                texto={`⚠ Repor (${resumo.precisamAtencao})`}
                destaque
              />
            )}
            {categorias.map((c) => (
              <Chip
                key={c}
                ativo={filtro === c}
                onClick={() => setFiltro(c)}
                texto={c}
              />
            ))}
          </div>
        )}

        {/* Ordenação */}
        {produtos.length > 0 && (
          <div className="flex items-center justify-end gap-2">
            <ArrowUpDown className="size-4 text-gray-400" />
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              aria-label="Ordenar produtos"
              className="h-9 rounded-md border border-input bg-white px-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="atencao">Atenção primeiro</option>
              <option value="nome">Nome (A–Z)</option>
              <option value="maior">Mais estoque</option>
              <option value="menor">Menos estoque</option>
              <option value="vendidos">Mais vendidos</option>
            </select>
          </div>
        )}

        {/* Lista */}
        {!hydrated ? (
          <p className="py-10 text-center text-gray-400">Carregando...</p>
        ) : semProdutos ? (
          <MensagemEstado
            icone={<Package className="size-12" />}
            titulo="Seu estoque está vazio"
            descricao="Cadastre seu primeiro produto para começar a controlar as entradas e saídas."
            acao={
              <div className="flex flex-col items-center gap-2">
                <Link href="/produtos/novo">
                  <Button className="h-12 gap-2 px-6 text-base">
                    <PackagePlus className="size-5" /> Cadastrar produto
                  </Button>
                </Link>
                <button
                  onClick={popularExemplos}
                  className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
                >
                  ou carregar produtos de exemplo
                </button>
              </div>
            }
          />
        ) : visiveis.length === 0 ? (
          <MensagemEstado
            titulo="Nenhum produto encontrado"
            descricao="Tente outro nome ou filtro."
          />
        ) : (
          <div className="space-y-2">
            {visiveis.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}
          </div>
        )}
      </div>

      {/* Botão flutuante (celular) */}
      <Link
        href="/produtos/novo"
        aria-label="Novo produto"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
      >
        <Plus className="size-7" />
      </Link>
    </div>
  );
}

function Chip({
  texto,
  ativo,
  onClick,
  destaque,
}: {
  texto: string;
  ativo: boolean;
  onClick: () => void;
  destaque?: boolean;
}) {
  const base =
    "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";
  const estilo = ativo
    ? "border-primary bg-primary text-primary-foreground"
    : destaque
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50";
  return (
    <button onClick={onClick} className={`${base} ${estilo}`}>
      {texto}
    </button>
  );
}
