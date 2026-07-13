import { statusEstoque, STATUS_INFO } from "@/lib/estoque";
import type { Produto } from "@/types";

/** Selo colorido indicando se o produto está em estoque, baixo ou zerado. */
export function StatusBadge({ produto }: { produto: Produto }) {
  const info = STATUS_INFO[statusEstoque(produto)];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${info.badge}`}
    >
      {info.label}
    </span>
  );
}
