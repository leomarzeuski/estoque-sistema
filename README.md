# 📦 Meu Estoque

Sistema **simples e rápido** de controle de estoque, pensado para o dia a dia de
um comerciante de hortifruti do **CEAGESP**. Funciona no **celular e no
computador**, com foco em usabilidade para pessoas que não têm familiaridade com
tecnologia.

> **Resumo:** cadastre seus produtos, registre o que **entra** e o que **sai**, e
> veja num piscar de olhos **o que está acabando**. Tudo salvo no próprio
> aparelho, **sem precisar de internet**.

---

## ✨ O que o sistema faz

- **Cadastro de produtos** com categoria, unidade (caixa, saco, kg...), preço de
  custo, preço de venda e estoque mínimo.
- **Controle de estoque**: registre **entradas** (mercadoria que chega) e
  **saídas** (mercadoria que sai) com botões grandes e diretos.
- **Ajuste por contagem**: corrija o estoque para o valor real após uma conferência.
- **Painel rápido**: total de produtos, quantos **precisam de reposição** e o
  **valor parado** em estoque.
- **Alertas visuais** de "estoque baixo" e "sem estoque".
- **Busca e filtros** por nome e categoria.
- **Histórico** de todas as movimentações de cada produto.
- **Lista de compras** automática do que está acabando, com quantidade sugerida e
  **compartilhamento no WhatsApp**.
- **Desfazer** entradas/saídas com um toque (rede de segurança contra erros).
- **Venda rápida**: monte o carrinho, finalize e o estoque baixa sozinho, com
  **recibo em PDF**.
- **Histórico** geral de tudo que entra e sai, agrupado por dia e com o
  **faturamento** do dia.
- **Relatório do estoque em PDF** para imprimir ou guardar.
- **Backup**: exportar e restaurar todos os dados num arquivo (tela **Ajustes**).
- **Funciona offline** e pode ser **instalado como aplicativo** no celular (PWA).

📖 Guia passo a passo para o usuário final: [`docs/GUIA-DE-USO.md`](docs/GUIA-DE-USO.md)

---

## 🚀 Como rodar o projeto

Pré-requisitos: **Node.js 18+** e **npm**.

```bash
# 1. Instalar dependências (use --legacy-peer-deps por causa do React 19)
npm install --legacy-peer-deps

# 2. Rodar em modo desenvolvimento
npm run dev

# 3. Abrir no navegador
# http://localhost:3000
```

Outros comandos:

```bash
npm run build   # gera a versão de produção
npm run start   # roda a versão de produção
npm run lint    # verifica padrões de código
```

> **Login:** o sistema tem uma tela de login simples. Como os dados ficam no
> próprio aparelho, qualquer e-mail válido e uma senha de 6+ caracteres entram.
> Veja [a seção de autenticação](docs/ARQUITETURA.md#autenticação) para detalhes.

---

## 🧱 Tecnologias

| Camada        | Tecnologia                                            |
| ------------- | ----------------------------------------------------- |
| Framework     | [Next.js 15](https://nextjs.org) (App Router)         |
| Linguagem     | TypeScript                                            |
| UI            | React 19, Tailwind CSS, [shadcn/ui](https://ui.shadcn.com) |
| Ícones        | lucide-react                                          |
| Formulários   | react-hook-form + zod                                 |
| Notificações  | sonner (toasts)                                       |
| Armazenamento | `localStorage` do navegador (offline)                 |

---

## 📁 Estrutura do projeto

```
src/
├── app/                      # Rotas (Next.js App Router)
│   ├── page.tsx              # Painel de estoque (tela inicial)
│   ├── login/                # Tela de login
│   └── produtos/
│       ├── novo/             # Cadastrar produto
│       └── [id]/             # Detalhe do produto
│           └── editar/       # Editar produto
├── components/
│   ├── produtos/             # Componentes do domínio (cards, formulário, drawer...)
│   ├── ui/                   # Componentes base do shadcn/ui
│   ├── navbar/               # Menu lateral (desktop)
│   └── bottomNavbar/         # Menu inferior (celular)
├── services/                 # Regras de negócio (produtos, movimentações)
├── hooks/                    # Hooks reativos (useProdutos, useMovimentacoes...)
├── lib/                      # Utilidades (db local, formatação, regras de estoque)
├── data/                     # Listas fixas (categorias, unidades) e exemplos
└── types/                    # Tipos do domínio (Produto, Movimentacao)
```

---

## 📚 Documentação

- [`docs/GUIA-DE-USO.md`](docs/GUIA-DE-USO.md) — Como usar o sistema (para o usuário final).
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) — Como o sistema é construído por dentro.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Próximos passos e melhorias futuras.
- [`CLAUDE.md`](CLAUDE.md) — Orientações para quem (ou qual IA) for editar o código.

---

## ⚠️ Importante saber

- Os dados ficam **apenas no aparelho onde foram digitados**. O celular e o
  computador **não compartilham** os dados entre si (ainda — veja o roadmap).
- Limpar os dados do navegador apaga o estoque. Por isso, faça **backup** de vez em
  quando na tela **Ajustes** (botão "Baixar backup") — e use "Restaurar backup"
  para trazer os dados de volta ou levá-los para outro aparelho.
