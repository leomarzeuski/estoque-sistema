import { useSyncExternalStore } from "react";

import { subscribe, getSnapshot, getServerSnapshot } from "@/lib/db";

/**
 * Lê uma coleção do armazenamento local de forma reativa: sempre que os
 * dados daquela coleção mudam (nesta ou em outra aba), os componentes que
 * usam este hook re-renderizam automaticamente.
 */
export function useCollection<T>(key: string): T[] {
  return useSyncExternalStore(
    (callback) => subscribe(key, callback),
    () => getSnapshot<T>(key),
    () => getServerSnapshot<T>()
  );
}
