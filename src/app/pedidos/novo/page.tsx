/* eslint-disable */
"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Produto = {
  id: number;
  nome: string;
  valor: number;
};

type TipoEmbalagem = {
  id: string;
  nome: string;
  multiplicador: number;
};

type ProdutoPedido = {
  id: number | string;
  nome: string;
  valor: number;
  tipo: string; // "unidade" | "caixa" | "pacote"
  quantidade: number;
  desconto: number;
  descontoTipo: "R$" | "%";
  total: number;
};

type Pedido = {
  data: string;
  pessoa: string;
  status: string;
  produtos: ProdutoPedido[];
};

const PRODUTOS_FAKE: Produto[] = [
  { id: 1, nome: "Maçã", valor: 3 },
  { id: 2, nome: "Banana", valor: 2 },
  { id: 3, nome: "Laranja", valor: 4 },
  { id: 4, nome: "Uva", valor: 5 },
];

const TIPOS_EMBALAGEM: TipoEmbalagem[] = [
  { id: "unidade", nome: "Unidade", multiplicador: 1 },
  { id: "caixa", nome: "Caixa", multiplicador: 12 },
  { id: "pacote", nome: "Pacote", multiplicador: 6 },
];

export default function NovoPedidoPage() {
  const router = useRouter();

  const [pedido, setPedido] = useState<Pedido>({
    data: "",
    pessoa: "",
    status: "Pendente",
    produtos: [],
  });

  const [produtoAtual, setProdutoAtual] = useState<ProdutoPedido>({
    id: "",
    nome: "",
    valor: 0,
    tipo: "unidade",
    quantidade: 1,
    desconto: 0,
    descontoTipo: "R$",
    total: 0,
  });

  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);

  /**
   * Formata um valor numérico para o padrão de moeda brasileiro.
   */
  const formatarValor = (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  /**
   * Calcula o valor base e o valor com desconto para exibição imediata.
   */
  const calcularValoresAtuais = React.useMemo(() => {
    const tipoSelecionado = TIPOS_EMBALAGEM.find(
      (tipo) => tipo.id === produtoAtual.tipo
    );

    const baseValor =
      produtoAtual.valor *
      produtoAtual.quantidade *
      (tipoSelecionado?.multiplicador || 1);

    const descontoCalculado =
      produtoAtual.descontoTipo === "%"
        ? (baseValor * produtoAtual.desconto) / 100
        : produtoAtual.desconto;

    const valorFinal = Math.max(baseValor - descontoCalculado, 0);

    return {
      valorSemDesconto: baseValor,
      valorComDesconto: valorFinal,
    };
  }, [produtoAtual]);

  /**
   * Adiciona ou salva alterações de um produto no estado do pedido.
   */
  const handleAddProduto = () => {
    // Evita adicionar caso algum dado essencial esteja faltando
    if (!produtoAtual.id || produtoAtual.quantidade < 1) return;

    const { valorComDesconto } = calcularValoresAtuais;

    if (editandoIndex !== null) {
      // Edição
      setPedido((prev) => {
        const produtos = [...prev.produtos];
        produtos[editandoIndex] = {
          ...produtoAtual,
          total: valorComDesconto,
        };
        return { ...prev, produtos };
      });
      setEditandoIndex(null);
    } else {
      // Adição
      setPedido((prev) => ({
        ...prev,
        produtos: [
          ...prev.produtos,
          {
            ...produtoAtual,
            total: valorComDesconto,
          },
        ],
      }));
    }

    // Reseta o produtoAtual
    setProdutoAtual({
      id: "",
      nome: "",
      valor: 0,
      tipo: "unidade",
      quantidade: 1,
      desconto: 0,
      descontoTipo: "R$",
      total: 0,
    });
  };

  /**
   * Carrega os dados de um produto no formulário para edição.
   */
  const handleEditProduto = (index: number): void => {
    const produto = pedido.produtos[index];
    setProdutoAtual(produto);
    setEditandoIndex(index);
  };

  /**
   * Remove um produto da lista de produtos do pedido.
   */
  const handleRemoveProduto = (index: number): void => {
    setPedido((prev) => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
    }));
    if (editandoIndex === index) {
      // Se estava editando o produto removido, reseta o formulário
      setProdutoAtual({
        id: "",
        nome: "",
        valor: 0,
        tipo: "unidade",
        quantidade: 1,
        desconto: 0,
        descontoTipo: "R$",
        total: 0,
      });
      setEditandoIndex(null);
    }
  };

  const gerarPDF = () => {
    // 1. Crie uma instância do jsPDF
    const doc = new jsPDF();

    // 2. Adicione texto ou título (x:10, y:10)
    doc.setFontSize(14);
    doc.text(`Pedido - ${pedido.pessoa}`, 10, 10);

    // 3. Crie uma tabela com os dados do pedido usando autoTable
    autoTable(doc, {
      startY: 20,
      head: [["Produto", "Tipo", "Qtde", "Desconto", "Total"]],
      body: pedido.produtos.map((prod) => {
        const nomeTipo = TIPOS_EMBALAGEM.find((t) => t.id === prod.tipo)?.nome;
        return [
          prod.nome,
          nomeTipo ?? "",
          prod.quantidade,
          prod.descontoTipo === "%"
            ? `${prod.desconto}%`
            : formatarValor(prod.desconto),
          formatarValor(prod.total),
        ];
      }),
    });

    // 4. Outras informações do pedido
    doc.text(
      `Data: ${pedido.data}`,
      10,
      (doc as any).lastAutoTable.finalY + 10
    );
    doc.text(
      `Status: ${pedido.status}`,
      10,
      (doc as any).lastAutoTable.finalY + 20
    );

    // 5. Salvar/baixar o PDF
    doc.save(`Pedido_${pedido.pessoa || "Cliente"}.pdf`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Novo Pedido:", pedido);

    gerarPDF();

    router.push("/");
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Adicionar Novo Pedido</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data */}
        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <Input
            type="date"
            value={pedido.data}
            onChange={(e) =>
              setPedido((prev) => ({ ...prev, data: e.target.value }))
            }
          />
        </div>

        {/* Pessoa */}
        <div>
          <label className="block text-sm font-medium mb-1">Pessoa</label>
          <Input
            type="text"
            placeholder="Nome do cliente"
            value={pedido.pessoa}
            onChange={(e) =>
              setPedido((prev) => ({ ...prev, pessoa: e.target.value }))
            }
          />
        </div>

        {/* Produto */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Adicionar Produto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Seletor de produto */}
            <div>
              <label className="block text-sm font-medium mb-1">Produto</label>
              <select
                className="block w-full border border-gray-300 rounded-md p-2"
                value={produtoAtual.id}
                onChange={(e) => {
                  const selecionado = PRODUTOS_FAKE.find(
                    (p) => p.id.toString() === e.target.value
                  );
                  if (selecionado) {
                    setProdutoAtual((prev) => ({
                      ...prev,
                      id: selecionado.id,
                      nome: selecionado.nome,
                      valor: selecionado.valor,
                    }));
                  }
                }}
              >
                <option value="">Selecione um produto</option>
                {PRODUTOS_FAKE.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de embalagem */}
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                className="block w-full border border-gray-300 rounded-md p-2"
                value={produtoAtual.tipo}
                onChange={(e) =>
                  setProdutoAtual((prev) => ({ ...prev, tipo: e.target.value }))
                }
              >
                {TIPOS_EMBALAGEM.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantidade
              </label>
              <Input
                type="number"
                min="1"
                value={produtoAtual.quantidade}
                onChange={(e) =>
                  setProdutoAtual((prev) => ({
                    ...prev,
                    quantidade: parseInt(e.target.value, 10) || 1,
                  }))
                }
              />
            </div>

            {/* Desconto */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Desconto ( opcional )
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={produtoAtual.desconto}
                  onChange={(e) =>
                    setProdutoAtual((prev) => ({
                      ...prev,
                      desconto: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <select
                  className="block border border-gray-300 rounded-md p-2"
                  value={produtoAtual.descontoTipo}
                  onChange={(e) =>
                    setProdutoAtual((prev) => ({
                      ...prev,
                      descontoTipo: e.target.value as "R$" | "%",
                    }))
                  }
                >
                  <option value="R$">R$</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Valor sem/ com desconto */}
          <ValorAtualInfo
            produto={produtoAtual}
            TIPOS_EMBALAGEM={TIPOS_EMBALAGEM}
            formatarValor={formatarValor}
          />

          <Button type="button" variant="secondary" onClick={handleAddProduto}>
            {editandoIndex !== null ? "Salvar Alterações" : "Adicionar Produto"}
          </Button>
        </div>

        {/* Lista de Produtos */}
        <ListaProdutos
          pedido={pedido}
          handleEditProduto={handleEditProduto}
          handleRemoveProduto={handleRemoveProduto}
          formatarValor={formatarValor}
        />

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="block w-full border border-gray-300 rounded-md p-2"
            value={pedido.status}
            onChange={(e) =>
              setPedido((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="Pendente">Pendente</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {/* Botão de Adicionar Pedido */}
        <div className="flex justify-end">
          <Button type="submit">Adicionar Pedido</Button>
        </div>
      </form>
    </main>
  );
}
function ValorAtualInfo({
  produto,
  TIPOS_EMBALAGEM,
  formatarValor,
}: {
  produto: ProdutoPedido;
  TIPOS_EMBALAGEM: TipoEmbalagem[];
  formatarValor: (valor: number) => string;
}) {
  const tipoSelecionado = TIPOS_EMBALAGEM.find((t) => t.id === produto.tipo);
  const baseValor =
    produto.valor * produto.quantidade * (tipoSelecionado?.multiplicador || 1);

  const descontoCalculado =
    produto.descontoTipo === "%"
      ? (baseValor * produto.desconto) / 100
      : produto.desconto;

  const valorComDesconto = Math.max(baseValor - descontoCalculado, 0);

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Valor sem Desconto
        </label>
        <Input type="text" value={formatarValor(baseValor)} readOnly />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Valor com Desconto
        </label>
        <Input type="text" value={formatarValor(valorComDesconto)} readOnly />
      </div>
    </div>
  );
}

function ListaProdutos({
  pedido,
  handleEditProduto,
  handleRemoveProduto,
  formatarValor,
}: {
  pedido: Pedido;
  handleEditProduto: (index: number) => void;
  handleRemoveProduto: (index: number) => void;
  formatarValor: (valor: number) => string;
}) {
  if (pedido.produtos.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-2">Produtos Adicionados</h3>
        <p className="text-gray-500">Nenhum produto adicionado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="table-auto border-collapse w-full text-sm md:text-base">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-left px-4 py-3">Produto</th>
            <th className="text-left px-4 py-3">Tipo</th>
            <th className="text-left px-4 py-3">Quantidade</th>
            <th className="text-left px-4 py-3">Desconto</th>
            <th className="text-left px-4 py-3">Total</th>
            <th className="text-left px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedido.produtos.map((produto, index) => {
            const tipoEmbalagem = TIPOS_EMBALAGEM.find(
              (t) => t.id === produto.tipo
            )?.nome;

            return (
              <tr key={index} className="border-b">
                <td className="px-4 py-3">{produto.nome}</td>
                <td className="px-4 py-3">{tipoEmbalagem}</td>
                <td className="px-4 py-3">{produto.quantidade}</td>
                <td className="px-4 py-3">
                  {produto.descontoTipo === "%"
                    ? `${produto.desconto}%`
                    : formatarValor(produto.desconto)}
                </td>
                <td className="px-4 py-3">{formatarValor(produto.total)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleEditProduto(index)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveProduto(index)}
                  >
                    Remover
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
