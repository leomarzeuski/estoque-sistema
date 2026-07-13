"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/** Evento (não padronizado em todos os browsers) de "instalar PWA". */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "estoque:install-dispensado";

/**
 * Convida o usuário a instalar o app na tela inicial.
 * - Android/Chrome: usa o evento nativo `beforeinstallprompt`.
 * - iPhone/Safari: mostra a instrução manual (não há API nativa).
 * - Some se o app já estiver instalado ou se for dispensado.
 */
export function InstallBanner() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [visivel, setVisivel] = useState(false);
  const [dicaIOS, setDicaIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const navegador = navigator as Navigator & { standalone?: boolean };
    const jaInstalado =
      window.matchMedia("(display-mode: standalone)").matches ||
      navegador.standalone === true;
    if (jaInstalado) return;

    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // ignora se o armazenamento estiver indisponível
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      setDicaIOS(true);
      setVisivel(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
      setVisivel(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const fechar = () => {
    setVisivel(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignora
    }
  };

  const instalar = async () => {
    if (!evento) return;
    await evento.prompt();
    fechar();
  };

  if (!visivel) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
        <Download className="size-5 text-green-700" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-green-900">
          Instale na tela inicial
        </p>
        <p className="text-xs text-green-800">
          {dicaIOS
            ? "Toque em Compartilhar e em “Adicionar à Tela de Início”."
            : "Abra rápido, como um aplicativo."}
        </p>
      </div>
      {!dicaIOS && (
        <button
          onClick={instalar}
          className="shrink-0 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Instalar
        </button>
      )}
      <button
        onClick={fechar}
        aria-label="Fechar"
        className="shrink-0 text-green-700/70 hover:text-green-900"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}
