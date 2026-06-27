# CLAUDE.md

Orientações para o Claude Code (e desenvolvedores) ao trabalhar neste repositório.

## O que é este projeto

**Meu Estoque** — sistema de controle de estoque mobile-first para um comerciante
de hortifruti do CEAGESP. Prioridades, nesta ordem: **simplicidade de uso**
(usuário leigo), **rapidez** e **funcionar offline no celular e no PC**.

Decisões de produto já tomadas:
- Foco é **controle de estoque** (entradas/saídas), não pedidos/vendas.
- Dados ficam **no aparelho** (`localStorage`), **sem backend** por enquanto.
- Idioma da interface e do código de domínio: **português**.

## Comandos

```bash
npm install --legacy-peer-deps   # instalar (React 19 exige --legacy-peer-deps)
npm run dev                      # desenvolvimento (http://localhost:3000)
npm run build                    # build de produção (roda lint + checagem de tipos)
npm run lint                     # somente lint
```

Não há suíte de testes ainda.

## Arquitetura (resumo)

Fluxo de dados em camadas — **telas nunca acessam `localStorage` direto**:

- **`lib/db.ts`** — armazenamento em `localStorage` com cache + pub/sub (SSR-safe).
- **`services/`** — regras de negócio e escrita (`produtos.ts`, `movimentacoes.ts`).
- **`hooks/`** — leitura **reativa** via `useSyncExternalStore`
  (`useProdutos`, `useMovimentacoes`, `useCollection`).
- **`app/`** + **`components/`** — telas e UI.

Detalhes completos em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

### Regras importantes ao mexer no código

- **Para alterar estoque**, use sempre `registrarEntrada` / `registrarSaida` /
  `ajustarEstoque` de `services/produtos.ts`. Elas atualizam o produto **e**
  gravam o histórico juntos. Nunca escreva a `quantidade` na mão.
- **Para ler dados em componentes**, use os hooks (`useProdutos`, etc.), não os
  `services` (estes são para handlers/ações). Os hooks re-renderizam sozinhos.
- **Mantenha `services/movimentacoes.ts` sem importar `produtos.ts`** (a
  dependência é só de `produtos` → `movimentacoes`, para evitar ciclo).
- **Tudo que toca `localStorage` deve ser SSR-safe** (`typeof window`), senão o
  build do Next quebra.

## Convenções

- **Componentes do domínio** ficam em `components/produtos/`; os do shadcn/ui em
  `components/ui/` (não editar à toa).
- **Mobile-first**: botões grandes (`h-12`+), `<select>` nativo para selects,
  linguagem simples nos textos visíveis.
- **Formatação** (moeda/data/número) sempre via `lib/format.ts` (padrão pt-BR).
- **Status de estoque** sempre via `lib/estoque.ts` (`statusEstoque`, `STATUS_INFO`).
- **Notificações** ao usuário via `toast` do `sonner` (já há `<Toaster>` no layout).

## Pegadinhas conhecidas

- O **`Input`** (`components/ui/input.tsx`) foi customizado: mostra um botão "✕"
  para limpar quando é **controlado** e tem valor. Com `register` do
  react-hook-form (não-controlado) o botão não aparece — comportamento esperado.
- `useSyncExternalStore` exige snapshot estável: **não** crie um novo array a cada
  leitura em `lib/db.ts` (o cache em `Map` garante isso). Ordenação/filtragem deve
  ser feita nos hooks/componentes com `useMemo`.
- O **middleware** protege `/` e `/produtos/*`. Novas rotas privadas devem ser
  adicionadas ao `matcher` em `src/middleware.ts`.

## Ao adicionar uma funcionalidade nova

1. Tipo novo? Adicione em `src/types/`.
2. Persistência/regra? Crie/atualize um `service` (use `lib/db.ts`).
3. Leitura reativa? Exponha um `hook`.
4. UI? Componha com `components/ui/` e siga o padrão mobile-first.
5. Rota privada? Atualize o `matcher` do middleware.
6. Documente decisões relevantes em `docs/`.

## Próximos passos sugeridos

Veja [`docs/ROADMAP.md`](docs/ROADMAP.md). Os de maior valor imediato:
backup exportar/importar, tela de configurações e relatório em PDF (libs já
instaladas).
