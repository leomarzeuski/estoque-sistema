import { useMemo } from "react";

import { useCollection } from "./useCollection";
import { CLIENTES_KEY } from "@/services/clientes";
import type { Cliente } from "@/types";

/** Lista reativa de clientes, ordenada por nome. */
export function useClientes(): Cliente[] {
  const clientes = useCollection<Cliente>(CLIENTES_KEY);
  return useMemo(
    () => [...clientes].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [clientes]
  );
}
