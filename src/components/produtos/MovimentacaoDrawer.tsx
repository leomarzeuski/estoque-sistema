"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { abreviacaoUnidade } from "@/data/catalogo";
import { formatarNumero } from "@/lib/format";
import {
  registrarEntrada,
  registrarSaida,
  ajustarEstoque,
  desfazerMovimentacao,
} from "@/services/produtos";
import type { Produto, TipoMovimentacao, Movimentacao } from "@/types";

const CONFIG: Record<
  TipoMovimentacao,
  { titulo: string; rotulo: string; botao: string; cor: string }
> = {
  entrada: {
    titulo: "Registrar entrada",
    rotulo: "Quanto chegou?",
    botao: "Confirmar entrada",
    cor: "bg-green-600 hover:bg-green-700 text-white",
  },
  saida: {
    titulo: "Registrar saída",
    rotulo: "Quanto saiu?",
    botao: "Confirmar saída",
    cor: "bg-red-600 hover:bg-red-700 text-white",
  },
  ajuste: {
    titulo: "Ajustar estoque",
    rotulo: "Quantidade correta em estoque",
    botao: "Salvar ajuste",
    cor: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
};

export function MovimentacaoDrawer({
  produto,
  tipo,
  children,
}: {
  produto: Produto;
  tipo: TipoMovimentacao;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");

  const config = CONFIG[tipo];
  const unidade = abreviacaoUnidade(produto.unidade);

  // Ao abrir, prepara o valor inicial: vazio para entrada/saída,
  // estoque atual para ajuste (a pessoa corrige a partir do que tem).
  useEffect(() => {
    if (open) {
      setValor(tipo === "ajuste" ? String(produto.quantidade) : "");
      setMotivo("");
    }
  }, [open, tipo, produto.quantidade]);

  const numero = parseFloat(valor.replace(",", ".")) || 0;

  const alterar = (delta: number) => {
    setValor(String(Math.max(0, numero + delta)));
  };

  const confirmar = () => {
    if (tipo !== "ajuste" && numero <= 0) {
      toast.error("Informe uma quantidade maior que zero.");
      return;
    }
    if (tipo === "saida" && numero > produto.quantidade) {
      toast.error(
        `Só há ${formatarNumero(produto.quantidade)} ${unidade} em estoque.`
      );
      return;
    }

    let movimentacao: Movimentacao | undefined;
    let mensagem = "";
    if (tipo === "entrada") {
      movimentacao = registrarEntrada(produto.id, numero, motivo);
      mensagem = "Entrada registrada!";
    } else if (tipo === "saida") {
      movimentacao = registrarSaida(produto.id, numero, motivo);
      mensagem = "Saída registrada!";
    } else {
      movimentacao = ajustarEstoque(produto.id, numero, motivo);
      mensagem = "Estoque ajustado!";
    }

    if (movimentacao) {
      const registro = movimentacao;
      toast.success(mensagem, {
        action: {
          label: "Desfazer",
          onClick: () => {
            desfazerMovimentacao(registro);
            toast.info("Movimentação desfeita.");
          },
        },
      });
    }
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>{config.titulo}</DrawerTitle>
            <DrawerDescription>
              {produto.nome} — em estoque agora:{" "}
              {formatarNumero(produto.quantidade)} {unidade}
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4">
            <div>
              <Label className="mb-2 block text-base">{config.rotulo}</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 shrink-0 rounded-full"
                  onClick={() => alterar(-1)}
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
                  className="h-14 text-center text-2xl font-bold"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 shrink-0 rounded-full"
                  onClick={() => alterar(1)}
                  aria-label="Aumentar"
                >
                  <Plus className="size-6" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="motivo" className="mb-1 block text-base">
                Motivo <span className="text-gray-400">(opcional)</span>
              </Label>
              <Input
                id="motivo"
                className="h-12"
                placeholder={
                  tipo === "entrada"
                    ? "Ex: compra no box 42"
                    : tipo === "saida"
                      ? "Ex: venda, perda..."
                      : "Ex: conferência do dia"
                }
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={confirmar}
              className={`h-12 text-base ${config.cor}`}
            >
              {config.botao}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 text-base">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
