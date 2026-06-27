"use client";

import { useEffect } from "react";

/**
 * Registra o service worker (apenas em produção) para o app funcionar offline.
 * Em desenvolvimento não registra, para não atrapalhar o hot-reload.
 */
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // falha no registro não deve quebrar o app
      });
    };
    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });
  }, []);

  return null;
}
