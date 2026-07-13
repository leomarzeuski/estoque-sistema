/*
 * Service worker do Meu Estoque.
 * Permite abrir o app sem internet depois da primeira visita:
 * - navegações: tenta a rede e, se falhar, usa o cache (ou a home);
 * - demais arquivos: responde do cache e atualiza em segundo plano.
 * Os DADOS continuam no localStorage (não passam por aqui).
 */

const CACHE = "meu-estoque-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      await Promise.all(
        nomes.filter((nome) => nome !== CACHE).map((nome) => caches.delete(nome))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegação entre páginas: rede primeiro, cache como reserva.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresca = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresca.clone());
          return fresca;
        } catch {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(req)) ||
            (await cache.match("/")) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // Arquivos (JS, CSS, imagens): responde do cache e revalida em segundo plano.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cacheado = await cache.match(req);
      const daRede = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200) cache.put(req, resp.clone());
          return resp;
        })
        .catch(() => cacheado);
      return cacheado || daRede;
    })()
  );
});
