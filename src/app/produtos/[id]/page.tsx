"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Pencil,
  Plus,
  Minus,
  SlidersHorizontal,
  Trash2,
  Copy,
  Star,
  Archive,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { StatusBadge } from "@/components/produtos/StatusBadge";
import { MovimentacaoDrawer } from "@/components/produtos/MovimentacaoDrawer";
import { HistoricoMovimentacoes } from "@/components/produtos/HistoricoMovimentacoes";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProduto } from "@/hooks/useProdutos";
import { useHydrated } from "@/hooks/useHydrated";
import {
  removerProduto,
  alternarFavorito,
  alternarArquivado,
} from "@/services/produtos";
import { statusEstoque, STATUS_INFO, valorEmEstoque } from "@/lib/estoque";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { iconeCategoria } from "@/lib/categoria-icone";
import { nomeUnidade, abreviacaoUnidade } from "@/data/catalogo";
import { STORAGE } from "@/constants/storage";

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-gray-500">{rotulo}</span>
      <span className="text-right font-medium text-gray-900">{valor}</span>
    </div>
  );
}

export default function ProdutoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const produto = useProduto(id);
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div>
        <PageHeader titulo="Produto" voltarHref="/" />
        <p className="py-10 text-center text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div>
        <PageHeader titulo="Produto" voltarHref="/" />
        <MensagemEstado
          titulo="Produto não encontrado"
          descricao="Ele pode ter sido removido do estoque."
          acao={
            <Link href="/">
              <Button>Voltar para o estoque</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const status = statusEstoque(produto);
  const un = abreviacaoUnidade(produto.unidade);
  const lucro = produto.precoVenda - produto.precoCusto;

  const excluir = () => {
    removerProduto(produto.id);
    toast.success("Produto removido.");
    router.push("/");
  };

  return (
    <div className="pb-24 md:pb-8">
      <PageHeader
        titulo={`${iconeCategoria(produto.categoria)} ${produto.nome}`}
        voltarHref="/"
        acao={
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => alternarFavorito(produto.id)}
              aria-label="Favorito"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/20"
            >
              <Star
                className={`size-5 ${
                  produto.favorito ? "fill-amber-300 text-amber-300" : ""
                }`}
              />
            </button>
            <Link
              href={`/produtos/${produto.id}/editar`}
              aria-label="Editar produto"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/20"
            >
              <Pencil size={20} />
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Destaque de estoque + ações */}
        <section className="rounded-xl border bg-white p-5 text-center shadow-sm">
          <div className="flex justify-center">
            <StatusBadge produto={produto} />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            Em estoque
          </p>
          <p className={`text-5xl font-extrabold ${STATUS_INFO[status].texto}`}>
            {formatarNumero(produto.quantidade)}
          </p>
          <p className="text-gray-500">{nomeUnidade(produto.unidade)}</p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <MovimentacaoDrawer produto={produto} tipo="entrada">
              <Button className="h-14 flex-col gap-1 bg-green-600 text-white hover:bg-green-700">
                <Plus className="size-5" />
                <span className="text-xs">Entrada</span>
              </Button>
            </MovimentacaoDrawer>
            <MovimentacaoDrawer produto={produto} tipo="saida">
              <Button className="h-14 flex-col gap-1 bg-red-600 text-white hover:bg-red-700">
                <Minus className="size-5" />
                <span className="text-xs">Saída</span>
              </Button>
            </MovimentacaoDrawer>
            <MovimentacaoDrawer produto={produto} tipo="ajuste">
              <Button
                variant="outline"
                className="h-14 flex-col gap-1"
              >
                <SlidersHorizontal className="size-5" />
                <span className="text-xs">Ajustar</span>
              </Button>
            </MovimentacaoDrawer>
          </div>
        </section>

        {/* Informações */}
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900">Informações</h2>
          <div className="text-sm">
            <Linha rotulo="Categoria" valor={produto.categoria} />
            <Linha rotulo="Unidade" valor={nomeUnidade(produto.unidade)} />
            <Linha
              rotulo="Preço de custo"
              valor={formatarMoeda(produto.precoCusto)}
            />
            <Linha
              rotulo="Preço de venda"
              valor={formatarMoeda(produto.precoVenda)}
            />
            <Linha
              rotulo="Lucro por unidade"
              valor={formatarMoeda(lucro)}
            />
            <Linha
              rotulo="Valor em estoque"
              valor={formatarMoeda(valorEmEstoque(produto))}
            />
            <Linha
              rotulo="Estoque mínimo"
              valor={`${formatarNumero(produto.estoqueMinimo)} ${un}`}
            />
            {produto.fornecedor && (
              <Linha rotulo="Fornecedor" valor={produto.fornecedor} />
            )}
          </div>
          {produto.observacao && (
            <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              {produto.observacao}
            </p>
          )}
        </section>

        {/* Histórico */}
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Movimentações</h2>
          <HistoricoMovimentacoes
            produtoId={produto.id}
            unidade={produto.unidade}
          />
        </section>

        {/* Duplicar */}
        <Button
          variant="outline"
          className="h-12 w-full gap-2"
          onClick={() => {
            try {
              sessionStorage.setItem(STORAGE.MODELO, JSON.stringify(produto));
            } catch {
              // ignora
            }
            router.push("/produtos/novo");
          }}
        >
          <Copy className="size-4" />
          Duplicar produto
        </Button>

        {/* Arquivar */}
        <Button
          variant="outline"
          className="h-12 w-full gap-2"
          onClick={() => {
            alternarArquivado(produto.id);
            toast.success(
              produto.arquivado ? "Produto reativado." : "Produto arquivado."
            );
          }}
        >
          <Archive className="size-4" />
          {produto.arquivado ? "Reativar produto" : "Arquivar produto"}
        </Button>

        {/* Excluir */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="size-4" />
              Excluir produto
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir &quot;{produto.nome}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                O produto e todo o seu histórico de movimentações serão
                apagados. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={excluir}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
