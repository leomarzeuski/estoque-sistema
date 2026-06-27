"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CATEGORIAS, UNIDADES } from "@/data/catalogo";
import {
  criarProduto,
  atualizarProduto,
  ajustarEstoque,
  type ProdutoInput,
} from "@/services/produtos";
import { STORAGE } from "@/constants/storage";
import type { Produto } from "@/types";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do produto"),
  categoria: z.string().min(1, "Escolha a categoria"),
  unidade: z.string().min(1, "Escolha a unidade"),
  precoCusto: z.coerce.number().min(0, "Não pode ser negativo"),
  precoVenda: z.coerce.number().min(0, "Não pode ser negativo"),
  quantidade: z.coerce.number().min(0, "Não pode ser negativo"),
  estoqueMinimo: z.coerce.number().min(0, "Não pode ser negativo"),
  fornecedor: z.string().optional(),
  observacao: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const selectClasse =
  "flex h-12 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function Erro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return <p className="mt-1 text-sm text-red-600">{mensagem}</p>;
}

export function ProdutoForm({ produto }: { produto?: Produto }) {
  const router = useRouter();
  const editando = Boolean(produto);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: produto?.nome ?? "",
      categoria: produto?.categoria ?? "Fruta",
      unidade: produto?.unidade ?? "caixa",
      precoCusto: produto?.precoCusto ?? 0,
      precoVenda: produto?.precoVenda ?? 0,
      quantidade: produto?.quantidade ?? 0,
      estoqueMinimo: produto?.estoqueMinimo ?? 0,
      fornecedor: produto?.fornecedor ?? "",
      observacao: produto?.observacao ?? "",
    },
  });

  // Ao duplicar um produto, preenche o formulário com base no "modelo".
  useEffect(() => {
    if (produto) return; // edição não usa modelo
    try {
      const raw = sessionStorage.getItem(STORAGE.MODELO);
      if (!raw) return;
      const modelo = JSON.parse(raw) as Produto;
      reset({
        nome: `${modelo.nome} (cópia)`,
        categoria: modelo.categoria,
        unidade: modelo.unidade,
        precoCusto: modelo.precoCusto,
        precoVenda: modelo.precoVenda,
        quantidade: 0,
        estoqueMinimo: modelo.estoqueMinimo,
        fornecedor: modelo.fornecedor ?? "",
        observacao: modelo.observacao ?? "",
      });
      sessionStorage.removeItem(STORAGE.MODELO);
    } catch {
      // ignora
    }
  }, [produto, reset]);

  const onSubmit = (values: FormValues) => {
    const input: ProdutoInput = { ...values };
    if (editando && produto) {
      atualizarProduto(produto.id, input);
      // Mudar a quantidade no cadastro registra um ajuste (mantém o histórico).
      if (values.quantidade !== produto.quantidade) {
        ajustarEstoque(produto.id, values.quantidade, "Ajuste no cadastro");
      }
      toast.success("Produto atualizado!");
      router.push(`/produtos/${produto.id}`);
    } else {
      const novo = criarProduto(input);
      toast.success(`"${novo.nome}" cadastrado!`);
      router.push(`/produtos/${novo.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nome */}
      <div>
        <Label htmlFor="nome" className="mb-1 block text-base">
          Nome do produto
        </Label>
        <Input
          id="nome"
          className="h-12"
          placeholder="Ex: Tomate, Banana Prata..."
          autoFocus={!editando}
          {...register("nome")}
        />
        <Erro mensagem={errors.nome?.message} />
      </div>

      {/* Categoria + Unidade */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="categoria" className="mb-1 block text-base">
            Categoria
          </Label>
          <select id="categoria" className={selectClasse} {...register("categoria")}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="unidade" className="mb-1 block text-base">
            Unidade
          </Label>
          <select id="unidade" className={selectClasse} {...register("unidade")}>
            {UNIDADES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preços */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="precoCusto" className="mb-1 block text-base">
            Preço de custo (R$)
          </Label>
          <Input
            id="precoCusto"
            className="h-12"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            {...register("precoCusto")}
          />
          <Erro mensagem={errors.precoCusto?.message} />
        </div>
        <div>
          <Label htmlFor="precoVenda" className="mb-1 block text-base">
            Preço de venda (R$)
          </Label>
          <Input
            id="precoVenda"
            className="h-12"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            {...register("precoVenda")}
          />
          <Erro mensagem={errors.precoVenda?.message} />
        </div>
      </div>

      {/* Quantidade + Estoque mínimo */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="quantidade" className="mb-1 block text-base">
            {editando ? "Quantidade em estoque" : "Quantidade inicial"}
          </Label>
          <Input
            id="quantidade"
            className="h-12"
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            {...register("quantidade")}
          />
          {editando && (
            <p className="mt-1 text-xs text-gray-500">
              Mudar aqui registra um ajuste.
            </p>
          )}
          <Erro mensagem={errors.quantidade?.message} />
        </div>
        <div>
          <Label htmlFor="estoqueMinimo" className="mb-1 block text-base">
            Estoque mínimo
          </Label>
          <Input
            id="estoqueMinimo"
            className="h-12"
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            {...register("estoqueMinimo")}
          />
          <p className="mt-1 text-xs text-gray-500">
            Avisa quando o estoque chegar nesse valor.
          </p>
          <Erro mensagem={errors.estoqueMinimo?.message} />
        </div>
      </div>

      {/* Fornecedor */}
      <div>
        <Label htmlFor="fornecedor" className="mb-1 block text-base">
          Fornecedor / Box <span className="text-gray-400">(opcional)</span>
        </Label>
        <Input
          id="fornecedor"
          className="h-12"
          placeholder="Ex: Box 142"
          {...register("fornecedor")}
        />
      </div>

      {/* Observação */}
      <div>
        <Label htmlFor="observacao" className="mb-1 block text-base">
          Observação <span className="text-gray-400">(opcional)</span>
        </Label>
        <Textarea
          id="observacao"
          placeholder="Anotações sobre o produto..."
          {...register("observacao")}
        />
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 text-base"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="h-12 flex-1 text-base"
          disabled={isSubmitting}
        >
          {editando ? "Salvar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
