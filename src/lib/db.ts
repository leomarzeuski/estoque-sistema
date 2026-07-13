/**
 * Camada de armazenamento local (offline).
 *
 * Guarda coleções de dados no `localStorage` do navegador — não precisa de
 * servidor nem internet. Cada coleção é um array salvo sob uma chave.
 *
 * Além de ler/gravar, este módulo oferece um sistema de "inscrição" (pub/sub)
 * para que os componentes React se atualizem automaticamente quando os dados
 * mudam (ver `useCollection`). Também sincroniza entre abas abertas.
 */

const PREFIX = "estoque:";

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
/** Cache em memória. Garante que `getSnapshot` retorne a MESMA referência
 *  enquanto os dados não mudam — requisito do `useSyncExternalStore`. */
const cache = new Map<string, unknown[]>();
const EMPTY: readonly unknown[] = Object.freeze([]);

function storageKey(key: string): string {
  return PREFIX + key;
}

function readFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function ensureLoaded(key: string): void {
  if (!cache.has(key)) {
    cache.set(key, readFromStorage(key));
  }
}

/** Lê a coleção (do cache, carregando do localStorage na primeira vez). */
export function read<T>(key: string): T[] {
  if (typeof window === "undefined") return EMPTY as T[];
  ensureLoaded(key);
  return cache.get(key) as T[];
}

/** Grava a coleção, atualiza o cache e avisa os inscritos. */
export function write<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  cache.set(key, data);
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(data));
  } catch (erro) {
    // Pode falhar se o armazenamento estiver cheio ou bloqueado.
    console.error("Não foi possível salvar os dados localmente.", erro);
  }
  emit(key);
}

/** Snapshot estável para `useSyncExternalStore` (cliente). */
export function getSnapshot<T>(key: string): T[] {
  return read<T>(key);
}

/** Snapshot usado na renderização do servidor (sempre vazio). */
export function getServerSnapshot<T>(): T[] {
  return EMPTY as T[];
}

/** Inscreve um callback para ser chamado quando `key` mudar. */
export function subscribe(key: string, fn: Listener): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(fn);
  return () => {
    set?.delete(fn);
  };
}

function emit(key: string): void {
  listeners.get(key)?.forEach((fn) => fn());
}

// Mantém abas do mesmo navegador em sincronia.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key || !event.key.startsWith(PREFIX)) return;
    const key = event.key.slice(PREFIX.length);
    cache.set(key, readFromStorage(key));
    emit(key);
  });
}

/** Gera um id curto e único o suficiente para uso local. */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Apaga TODOS os dados do sistema (usado em "limpar tudo"). */
export function limparTudo(): void {
  if (typeof window === "undefined") return;
  const chaves = Object.keys(window.localStorage).filter((k) =>
    k.startsWith(PREFIX)
  );
  chaves.forEach((k) => window.localStorage.removeItem(k));
  // Recarrega o cache e notifica.
  for (const key of cache.keys()) {
    cache.set(key, []);
    emit(key);
  }
}
