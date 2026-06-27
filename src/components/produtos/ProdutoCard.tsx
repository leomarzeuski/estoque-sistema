"use client";

import Link from "next/link";
import { Plus, Minus, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { MovimentacaoDrawer } from "./MovimentacaoDrawer";
import { statusEstoque, STATUS_INFO } from "@/lib/estoque";
import { formatarNumero } from "@/lib/format";
import { abreviacaoUnidade } from "@/data/catalogo";
import { iconeCategoria } from "@/lib/categoria-icone";
import { alternarFavorito } from "@/services/produtos";
import type { Produto } from "@/types";

export function ProdutoCard({ produto }: { produto: Produto }) {
  const status = statusEstoque(produto);
  const un = abreviacaoUnidade(produto.unidade);

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border border-l-4 bg-white p-3 shadow-sm transition-transform active:scale-[0.99] ${STATUS_INFO[status].borda}`}
    >
      {/* Favoritar */}
      <button
        type="button"
        onClick={() => alternarFavorito(produto.id)}
        aria-label={produto.favorito ? "Desmarcar favorito" : "Marcar favorito"}
        className="shrink-0 text-gray-300 hover:text-amber-400"
      >
        <Star
          className={`size-5 ${
            produto.favorito ? "fill-amber-400 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Toca aqui para abrir o detalhe */}
      <Link href={`/produtos/${produto.id}`} className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900">
          <span className="mr-1">{iconeCategoria(produto.categoria)}</span>
          {produto.nome}
        </p>
        <p className="truncate text-xs text-gray-500">
          {produto.categoria} · mín. {formatarNumero(produto.estoqueMinimo)} {un}
        </p>
        {status !== "ok" && (
          <div className="mt-1">
            <StatusBadge produto={produto} />
          </div>
        )}
      </Link>

      {/* Quantidade atual */}
      <Link
        href={`/produtos/${produto.id}`}
        className="shrink-0 text-right leading-none"
      >
        <span className={`text-2xl font-bold ${STATUS_INFO[status].texto}`}>
          {formatarNumero(produto.quantidade)}
        </span>
        <span className="ml-1 text-xs text-gray-400">{un}</span>
      </Link>

      {/* Ações rápidas */}
      <div className="flex shrink-0 flex-col gap-1.5">
        <MovimentacaoDrawer produto={produto} tipo="entrada">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-green-200 text-green-700 hover:bg-green-50"
            aria-label="Registrar entrada"
          >
            <Plus className="size-5" />
          </Button>
        </MovimentacaoDrawer>
        <MovimentacaoDrawer produto={produto} tipo="saida">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-red-200 text-red-700 hover:bg-red-50"
            aria-label="Registrar saída"
          >
            <Minus className="size-5" />
          </Button>
        </MovimentacaoDrawer>
      </div>
    </div>
  );
}
