import { PageHeader } from "@/components/PageHeader";
import { ProdutoForm } from "@/components/produtos/ProdutoForm";

export default function NovoProdutoPage() {
  return (
    <div className="pb-24 md:pb-8">
      <PageHeader titulo="Novo Produto" voltarHref="/" />
      <div className="mx-auto max-w-2xl p-4">
        <ProdutoForm />
      </div>
    </div>
  );
}
