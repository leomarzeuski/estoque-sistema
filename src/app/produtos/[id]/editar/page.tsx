"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { ProdutoForm } from "@/components/produtos/ProdutoForm";
import { useProduto } from "@/hooks/useProdutos";
import { useHydrated } from "@/hooks/useHydrated";

export default function EditarProdutoPage() {
  const params = useParams();
  const id = String(params.id);
  const produto = useProduto(id);
  const hydrated = useHydrated();

  return (
    <div className="pb-24 md:pb-8">
      <PageHeader
        titulo="Editar Produto"
        voltarHref={`/produtos/${id}`}
      />
      <div className="mx-auto max-w-2xl p-4">
        {!hydrated ? (
          <p className="py-10 text-center text-gray-400">Carregando...</p>
        ) : produto ? (
          <ProdutoForm produto={produto} />
        ) : (
          <MensagemEstado
            titulo="Produto não encontrado"
            descricao="Ele pode ter sido removido."
          />
        )}
      </div>
    </div>
  );
}
