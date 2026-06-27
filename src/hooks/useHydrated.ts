import { useEffect, useState } from "react";

/**
 * Retorna `false` no servidor e no primeiro render do cliente, e `true`
 * depois que o componente "monta" no navegador.
 *
 * Útil para evitar mostrar "nenhum produto" por um instante antes de os
 * dados salvos no aparelho serem carregados.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
