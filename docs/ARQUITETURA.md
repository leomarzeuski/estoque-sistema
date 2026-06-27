# 🏗️ Arquitetura

Este documento explica como o sistema funciona por dentro. É voltado para
desenvolvedores que vão dar manutenção ou evoluir o projeto.

---

## Visão geral

```
┌─────────────────────────────────────────────────────────┐
│                        Telas (app/)                       │
│   page.tsx · produtos/novo · produtos/[id] · /editar      │
└───────────────┬───────────────────────────┬──────────────┘
                │ usa hooks reativos         │ chama ações
                ▼                            ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   hooks/ (reatividade)     │   │   services/ (regras)       │
│   useProdutos              │   │   produtos.ts              │
│   useMovimentacoes         │   │   movimentacoes.ts         │
└───────────────┬───────────┘   └───────────────┬───────────┘
                │ useSyncExternalStore           │ read/write
                └───────────────┬────────────────┘
                                ▼
                  ┌───────────────────────────┐
                  │   lib/db.ts                │
                  │   localStorage + pub/sub   │
                  └───────────────────────────┘
```

O princípio é: **as telas nunca falam direto com o `localStorage`**. Elas leem
através de _hooks_ (que se atualizam sozinhos) e escrevem através de _services_
(que aplicam as regras e gravam o histórico).

---

## Modelo de dados

Definido em [`src/types/index.ts`](../src/types/index.ts).

### `Produto`

| Campo           | Tipo     | Descrição                                       |
| --------------- | -------- | ----------------------------------------------- |
| `id`            | string   | Identificador único.                            |
| `nome`          | string   | Nome do produto.                                |
| `categoria`     | string   | Ex: "Fruta", "Verdura" (ver `data/catalogo`).   |
| `unidade`       | string   | Como o estoque é contado: `caixa`, `saco`, `kg`...|
| `precoCusto`    | number   | Quanto custou (por unidade).                    |
| `precoVenda`    | number   | Por quanto é revendido.                         |
| `quantidade`    | number   | Estoque atual. **Só muda via movimentação.**    |
| `estoqueMinimo` | number   | Limite para alertar "estoque baixo".            |
| `fornecedor?`   | string   | Box/fornecedor (opcional).                      |
| `observacao?`   | string   | Anotações (opcional).                           |
| `criadoEm`      | string   | Data ISO de criação.                            |
| `atualizadoEm`  | string   | Data ISO da última alteração.                   |

### `Movimentacao`

Cada entrada, saída ou ajuste gera um registro **imutável** no histórico.
Ele guarda um "retrato" (`produtoNome`, `estoqueAntes`, `estoqueDepois`) para
continuar legível mesmo se o produto for editado/removido depois.

| Campo            | Tipo                              | Descrição                       |
| ---------------- | --------------------------------- | ------------------------------- |
| `id`             | string                            | Identificador único.            |
| `produtoId`      | string                            | A qual produto pertence.        |
| `produtoNome`    | string                            | Nome no momento da movimentação.|
| `tipo`           | `entrada` \| `saida` \| `ajuste`  | Sentido da movimentação.        |
| `quantidade`     | number                            | Quanto foi movimentado.         |
| `estoqueAntes`   | number                            | Estoque antes.                  |
| `estoqueDepois`  | number                            | Estoque depois.                 |
| `motivo?`        | string                            | Ex: "Venda", "Perda".           |
| `data`           | string                            | Data/hora ISO.                  |

---

## Camada de armazenamento — `lib/db.ts`

Guarda cada coleção como um array JSON no `localStorage`, sob uma chave com
prefixo `estoque:` (ex: `estoque:produtos`, `estoque:movimentacoes`).

Pontos importantes:

- **SSR-safe**: todas as funções checam `typeof window` e devolvem vazio no
  servidor — nada quebra durante o build/SSR do Next.js.
- **Cache em memória**: existe um `Map` que mantém a referência do array de cada
  coleção. Isso é **essencial** para o `useSyncExternalStore`, que exige que o
  _snapshot_ seja a **mesma referência** enquanto os dados não mudam (senão entra
  em loop de re-render).
- **Pub/sub**: `subscribe(key, fn)` permite reagir a mudanças. `write()` chama
  `emit()` para avisar todos os inscritos.
- **Entre abas**: um listener de `window.addEventListener("storage", ...)`
  mantém abas diferentes do mesmo navegador sincronizadas.

### Reatividade — `hooks/useCollection.ts`

```ts
useSyncExternalStore(
  (cb) => subscribe(key, cb),     // re-renderiza quando a coleção muda
  () => getSnapshot<T>(key),      // valor no cliente (do cache)
  () => getServerSnapshot<T>()    // valor no servidor (vazio)
);
```

Sobre o `getServerSnapshot` vazio: no primeiro render do cliente o React pode
mostrar a lista vazia por um instante antes de carregar os dados do aparelho.
Por isso usamos o hook [`useHydrated`](../src/hooks/useHydrated.ts) para exibir
"Carregando..." e evitar o "pisca" de tela vazia.

---

## Regras de negócio — `services/`

### `services/produtos.ts`

- `criarProduto`, `atualizarProduto`, `removerProduto`, `listarProdutos`, `obterProduto`.
- `registrarEntrada`, `registrarSaida`, `ajustarEstoque`.

**Regra central:** toda alteração de quantidade passa por `aplicarMovimentacao`,
que (1) atualiza o produto e (2) grava o histórico, de forma consistente. O
estoque nunca fica negativo (`Math.max(0, ...)`).

A `atualizarProduto` **não** mexe na quantidade de propósito — quantidade só muda
por entrada/saída/ajuste, mantendo o histórico fiel.

### `services/movimentacoes.ts`

Só lê e grava o histórico (`listarMovimentacoes`, `appendMovimentacao`,
`removerMovimentacoesDoProduto`). Não conhece a lógica de produtos, o que evita
dependência circular (`produtos` → `movimentacoes`, em mão única).

---

## Componentes principais

| Componente                              | Papel                                            |
| --------------------------------------- | ------------------------------------------------ |
| `app/page.tsx`                          | Painel: resumo, busca, filtros e lista.          |
| `components/produtos/ProdutoCard`       | Item da lista com ações rápidas ➕➖.             |
| `components/produtos/ProdutoForm`       | Formulário de cadastro/edição (react-hook-form). |
| `components/produtos/MovimentacaoDrawer`| Bottom sheet de entrada/saída/ajuste.            |
| `components/produtos/HistoricoMovimentacoes` | Lista o histórico de um produto.            |
| `components/produtos/StatusBadge`       | Selo colorido de status do estoque.              |
| `components/PageHeader`                 | Cabeçalho com "voltar".                          |
| `components/MensagemEstado`             | Estados vazios / "não encontrado".               |

---

## Layout responsivo

`components/responsiveLayout` decide a navegação:

- **Celular** (`md:hidden`): menu inferior fixo (`bottomNavbar`) + botão flutuante.
- **Computador** (`hidden md:flex`): menu lateral (`navbar`/sidebar).
- A tela de **login** é renderizada sem menus.

Todo o sistema é **mobile-first**: botões grandes (altura 48–56px), fontes
legíveis, e os seletores usam o `<select>` nativo (que abre o seletor do próprio
celular, mais familiar para o usuário).

---

## Autenticação

Implementação **mínima e local** (`context/AuthContext.tsx` + `middleware.ts`):

- O login é com **um toque** (nome opcional, sem senha). Guarda um token fixo em
  cookie (`js-cookie`, 7 dias) e o nome no `localStorage`.
- O `middleware` protege as telas internas (`/`, `/produtos/*`, `/venda`,
  `/historico`, `/configuracoes`), redirecionando para `/login` quem não tiver o
  cookie.
- **Não há backend ainda**: o token é fixo (`"tempToken"`), só para o app não
  abrir "pelado". Ver o [roadmap](ROADMAP.md) para autenticação real.

---

## PWA (instalável)

- `public/manifest.webmanifest` + `public/icon.svg` definem nome, cores e ícone.
- `app/layout.tsx` declara `manifest`, `appleWebApp` e `themeColor`.
- Isso permite **"Adicionar à tela inicial"** no Android e iOS.
- **Service worker** (`public/sw.js`, registrado em `components/RegistrarSW.tsx`,
  só em produção): faz o app **abrir offline** após a primeira visita —
  navegação _network-first_ com reserva no cache e arquivos em
  _stale-while-revalidate_. Os dados continuam no `localStorage`.

---

## Decisões de projeto

1. **Por que `localStorage` e não um banco?** O pedido era algo rápido, gratuito
   e offline. `localStorage` entrega isso sem servidor. O custo é não sincronizar
   entre aparelhos — aceitável para começar e fácil de evoluir depois.
2. **Por que separar `hooks` de `services`?** Para que a leitura seja reativa e a
   escrita seja centralizada com regras. Facilita trocar a camada de dados (ex:
   por uma API) mexendo em poucos lugares.
3. **Por que registrar histórico em tudo?** Rastreabilidade: o dono consegue
   entender o que aconteceu com cada produto, e isso vira base para relatórios.
