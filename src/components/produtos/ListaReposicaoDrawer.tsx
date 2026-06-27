"use client";

import { useState } from "react";
import { ShoppingCart, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { listaReposicao, textoListaCompras } from "@/lib/reposicao";
import { formatarNumero } from "@/lib/format";
import { abreviacaoUnidade } from "@/data/catalogo";
import { statusEstoque } from "@/lib/estoque";
import type { Produto } from "@/types";

export function ListaReposicaoDrawer({
  produtos,
  children,
}: {
  produtos: Produto[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const itens = listaReposicao(produtos);

  const compartilhar = async () => {
    const texto = textoListaCompras(itens);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Lista de compras", text: texto });
        return;
      }
    } catch {
      return; // usuário cancelou o compartilhamento
    }
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Lista copiada! É só colar no WhatsApp.");
    } catch {
      toast.error("Não foi possível compartilhar a lista.");
    }
  };

  const enviarWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      textoListaCompras(itens)
    )}`;
    window.open(url, "_blank");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" /> Lista de compras
            </DrawerTitle>
            <DrawerDescription>
              {itens.length === 0
                ? "Tudo em dia!"
                : `${itens.length} produto(s) para repor`}
            </DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[50vh] overflow-y-auto px-4">
            {itens.length === 0 ? (
              <p className="py-6 text-center text-gray-500">
                Nada para repor agora. ✅
              </p>
            ) : (
              <ul className="divide-y">
                {itens.map(({ produto, comprar }) => {
                  const un = abreviacaoUnidade(produto.unidade);
                  const semEstoque = statusEstoque(produto) === "sem";
                  return (
                    <li
                      key={produto.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {produto.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {semEstoque ? (
                            <span className="font-medium text-red-600">
                              Acabou
                            </span>
                          ) : (
                            `Tem ${formatarNumero(produto.quantidade)} ${un}`
                          )}{" "}
                          · mín. {formatarNumero(produto.estoqueMinimo)} {un}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-amber-700">
                        comprar {formatarNumero(comprar)} {un}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <DrawerFooter>
            <Button
              onClick={enviarWhatsApp}
              disabled={itens.length === 0}
              className="h-12 gap-2 bg-green-600 text-base text-white hover:bg-green-700"
            >
              <MessageCircle className="size-5" /> Enviar no WhatsApp
            </Button>
            <Button
              onClick={compartilhar}
              variant="outline"
              disabled={itens.length === 0}
              className="h-12 gap-2 text-base"
            >
              <Share2 className="size-5" /> Compartilhar
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 text-base">
                Fechar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
