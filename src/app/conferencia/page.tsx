"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProdutos } from "@/hooks/useProdutos";
import { useHydrated } from "@/hooks/useHydrated";
import { ajustarEstoque } from "@/services/produtos";
import { formatarNumero } from "@/lib/format";
import { nomeUnidade, abreviacaoUnidade } from "@/data/catalogo";
import type { Produto } from "@/types";

export default function ConferenciaPage() {
  const produtosAtuais = useProdutos();
  const hydrated = useHydrated();

  // "Foto" da lista no início — fica estável durante a conferência.
  const [lista, setLista] = useState<Produto[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [valor, setValor] = useState("");
  const [ajustados, setAjustados] = useState(0);

  useEffect(() => {
    if (lista === null && hydrated && produtosAtuais.length > 0) {
      setLista(produtosAtuais);
    }
  }, [lista, hydrated, produtosAtuais]);

  useEffect(() => {
    if (lista && indice < lista.length) {
      setValor(String(lista[indice].quantidade));
    }
  }, [lista, indice]);

  const atual = lista && indice < lista.length ? lista[indice] : null;
  const numero = parseFloat(valor.replace(",", ".")) || 0;
  const concluido = Boolean(lista) && indice >= (lista?.length ?? 0);

  const confirmar = () => {
    if (!atual) return;
    if (valor.trim() === "" || numero < 0) {
      toast.error("Informe a quantidade contada.");
      return;
    }
    if (numero !== atual.quantidade) {
      ajustarEstoque(atual.id, numero, "Conferência");
      setAjustados((a) => a + 1);
    }
    setIndice((i) => i + 1);
  };

  const refazer = () => {
    setLista(produtosAtuais);
    setIndice(0);
    setAjustados(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <PageHeader titulo="Conferência" voltarHref="/" />

      <div className="mx-auto max-w-md space-y-4 p-4">
        {!hydrated ? (
          <p className="py-10 text-center text-gray-400">Carregando...</p>
        ) : !lista || lista.length === 0 ? (
          <MensagemEstado
            icone={<ClipboardCheck className="size-12" />}
            titulo="Nada para conferir"
            descricao="Cadastre produtos para fazer a conferência do estoque."
          />
        ) : concluido ? (
          <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <ClipboardCheck className="size-7 text-green-700" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Conferência concluída!
            </h2>
            <p className="mt-1 text-gray-500">
              {ajustados === 0
                ? "Nenhuma diferença encontrada."
                : `${formatarNumero(ajustados)} produto(s) ajustado(s).`}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={refazer} variant="outline" className="h-12 text-base">
                Conferir de novo
              </Button>
              <Link href="/">
                <Button className="h-12 w-full text-base">
                  Voltar ao estoque
                </Button>
              </Link>
            </div>
          </div>
        ) : atual ? (
          <>
            <p className="text-center text-sm text-gray-500">
              {indice + 1} de {lista.length}
            </p>

            <div className="rounded-xl border bg-white p-5 text-center shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">{atual.nome}</h2>
              <p className="mt-1 text-sm text-gray-500">
                No sistema: {formatarNumero(atual.quantidade)}{" "}
                {abreviacaoUnidade(atual.unidade)}
              </p>

              <p className="mt-5 text-base font-medium text-gray-700">
                Quantos tem de verdade?
              </p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 shrink-0 rounded-full"
                  onClick={() => setValor(String(Math.max(0, numero - 1)))}
                  aria-label="Diminuir"
                >
                  <Minus className="size-6" />
                </Button>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="h-14 max-w-[8rem] text-center text-2xl font-bold"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 shrink-0 rounded-full"
                  onClick={() => setValor(String(numero + 1))}
                  aria-label="Aumentar"
                >
                  <Plus className="size-6" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {nomeUnidade(atual.unidade)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 flex-1 text-base"
                onClick={() => setIndice((i) => i + 1)}
              >
                Pular
              </Button>
              <Button
                className="h-12 flex-1 text-base"
                onClick={confirmar}
              >
                Confirmar
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
