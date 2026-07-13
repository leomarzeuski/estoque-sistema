"use client";

import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { toast } from "sonner";

/** Tipos mínimos da Web Speech API (não fazem parte da lib padrão do TS). */
interface ResultadoVoz {
  transcript: string;
}
interface EventoVoz {
  results: ArrayLike<ArrayLike<ResultadoVoz>>;
}
interface ReconhecimentoVoz {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: EventoVoz) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type ConstrutorVoz = new () => ReconhecimentoVoz;

function obterConstrutor(): ConstrutorVoz | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: ConstrutorVoz;
    webkitSpeechRecognition?: ConstrutorVoz;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

/** Botão de microfone que preenche a busca falando (some se não houver suporte). */
export function BotaoVoz({
  onResultado,
}: {
  onResultado: (texto: string) => void;
}) {
  const [suportado, setSuportado] = useState(false);
  const [ouvindo, setOuvindo] = useState(false);

  useEffect(() => {
    setSuportado(Boolean(obterConstrutor()));
  }, []);

  const ouvir = () => {
    const Construtor = obterConstrutor();
    if (!Construtor) return;
    const rec = new Construtor();
    rec.lang = "pt-BR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const texto = e.results[0]?.[0]?.transcript ?? "";
      if (texto) onResultado(texto);
    };
    rec.onend = () => setOuvindo(false);
    rec.onerror = () => {
      setOuvindo(false);
      toast.error("Não consegui ouvir. Tente de novo.");
    };
    setOuvindo(true);
    rec.start();
  };

  if (!suportado) return null;

  return (
    <button
      type="button"
      onClick={ouvir}
      aria-label="Buscar por voz"
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-input bg-white ${
        ouvindo
          ? "animate-pulse text-red-600"
          : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      <Mic className="size-5" />
    </button>
  );
}
