/* eslint-disable */

import { notFound } from "next/navigation";

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

export default function PedidoDetalhes(props: any) {
  const pedidoId = parseInt(props.params.id, 10);
  const pedido = PEDIDOS_FAKE.find((p) => p.id === pedidoId);

  if (!pedido) {
    return notFound();
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Detalhes do Pedido #{pedido.id}
      </h1>
      <div className="space-y-4">
        <p>
          <strong>Data:</strong> {pedido.data}
        </p>
        <p>
          <strong>Pessoa:</strong> {pedido.pessoa}
        </p>
        <p>
          <strong>Status:</strong> {pedido.status}
        </p>
        <p>
          <strong>Valor:</strong> R$ {pedido.valor.toFixed(2)}
        </p>
      </div>
    </main>
  );
}
