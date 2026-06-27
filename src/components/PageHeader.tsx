import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  titulo: string;
  /** Se informado, mostra uma seta de "voltar" que leva a esta rota. */
  voltarHref?: string;
  /** Conteúdo extra à direita (ex: um botão de ação). */
  acao?: React.ReactNode;
}

/** Cabeçalho fixo no topo da página, com seta de voltar opcional. */
export function PageHeader({ titulo, voltarHref, acao }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-white px-4 py-3">
      {voltarHref && (
        <Link
          href={voltarHref}
          aria-label="Voltar"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft size={22} />
        </Link>
      )}
      <h1 className="flex-1 truncate text-lg font-bold text-gray-900">
        {titulo}
      </h1>
      {acao}
    </header>
  );
}
