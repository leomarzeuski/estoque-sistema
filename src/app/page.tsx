"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const PEDIDOS_FAKE = [
  {
    id: 101,
    data: "2025-01-04",
    pessoa: "João Silva",
    status: "Pendente",
    valor: 250.0,
  },
  {
    id: 102,
    data: "2025-01-03",
    pessoa: "Maria Souza",
    status: "Concluído",
    valor: 500.0,
  },
  {
    id: 103,
    data: "2025-01-02",
    pessoa: "Carlos Santos",
    status: "Cancelado",
    valor: 100.0,
  },
];

export default function PedidosPage() {
  const router = useRouter();
  const [filtroPessoa, setFiltroPessoa] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const pedidosFiltrados = PEDIDOS_FAKE.filter((pedido) => {
    const matchPessoa = filtroPessoa
      ? pedido.pessoa.toLowerCase().includes(filtroPessoa.toLowerCase())
      : true;
    const matchData = filtroData ? pedido.data === filtroData : true;
    const matchStatus =
      filtroStatus === "all" ? true : pedido.status === filtroStatus;
    return matchPessoa && matchData && matchStatus;
  });

  const totalPages = Math.ceil(pedidosFiltrados.length / pageSize);
  const safePage = currentPage > totalPages ? totalPages : currentPage;
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pedidosPagina = pedidosFiltrados.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const limparFiltros = () => {
    setFiltroPessoa("");
    setFiltroData("");
    setFiltroStatus("all");
    setCurrentPage(1);
  };

  const filtrosAtivos = filtroPessoa || filtroData || filtroStatus !== "all";

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Listagem de Pedidos</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Pessoa</label>
          <Input
            placeholder="Ex: João"
            type="text"
            value={filtroPessoa}
            onChange={(e) => {
              setFiltroPessoa(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <Input
            type="date"
            value={filtroData}
            onChange={(e) => {
              setFiltroData(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            onValueChange={(val) => {
              setFiltroStatus(val);
              setCurrentPage(1);
            }}
            value={filtroStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botão de Adicionar Novo Pedido */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="secondary"
          onClick={() => router.push("/pedidos/novo")}
        >
          + Novo Pedido
        </Button>

        {filtrosAtivos && (
          <Button variant="destructive" onClick={limparFiltros}>
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Tabela de pedidos */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm ">
          <thead>
            <tr className="bg-blue-500 border-b">
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Data</th>
              <th className="text-left px-4 py-2">Pessoa</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPagina.map((pedido) => (
              <tr
                key={pedido.id}
                onClick={() => router.push(`/pedidos/${pedido.id}`)}
                className="border-b last:border-none hover:bg-gray-100 cursor-pointer"
              >
                <td className="px-4 py-2">{pedido.id}</td>
                <td className="px-4 py-2">{pedido.data}</td>
                <td className="px-4 py-2">{pedido.pessoa}</td>
                <td className="px-4 py-2">{pedido.status}</td>
                <td className="px-4 py-2">R$ {pedido.valor.toFixed(2)}</td>
              </tr>
            ))}
            {pedidosPagina.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center" colSpan={5}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="mt-8 flex items-center gap-2 justify-center">
        <Button
          variant="default"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage <= 1}
        >
          Anterior
        </Button>

        <span>
          Página {safePage} de {totalPages || 1}
        </span>

        <Button
          variant="default"
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage >= totalPages}
        >
          Próxima
        </Button>
      </div>
    </main>
  );
}
