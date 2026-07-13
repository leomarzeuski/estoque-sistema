/** Emoji que representa cada categoria, para dar vida e ajudar a reconhecer. */
const ICONES: Record<string, string> = {
  Fruta: "🍎",
  Verdura: "🥬",
  Legume: "🥕",
  Tempero: "🌿",
  Ovos: "🥚",
  Outros: "📦",
};

export function iconeCategoria(categoria: string): string {
  return ICONES[categoria] ?? "📦";
}
