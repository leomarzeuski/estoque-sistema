# 🗺️ Roadmap

Ideias de evolução, em ordem aproximada de valor para o usuário (o comerciante).
Marque com `[x]` o que for concluído.

## ✅ Já implementado

- [x] Cadastro, edição e exclusão de produtos.
- [x] Controle de estoque: entradas, saídas e ajuste por contagem.
- [x] Histórico de movimentações por produto.
- [x] Painel com resumo (produtos, reposição, valor em estoque).
- [x] Busca e filtros por nome/categoria.
- [x] Alertas de estoque baixo / sem estoque.
- [x] Layout mobile-first e instalável (PWA básico).
- [x] Armazenamento offline (localStorage).
- [x] **Backup**: exportar e restaurar todos os dados via arquivo `.json`.
- [x] **Tela de Ajustes**: backup, carregar exemplos e apagar tudo.
- [x] **Lista de compras**: itens para repor com quantidade sugerida e
      compartilhamento (WhatsApp / copiar).
- [x] **Desfazer** entradas, saídas e ajustes pelo aviso (toast).
- [x] **Convite para instalar** o app na tela inicial.
- [x] **Venda rápida** (carrinho) com baixa em lote e **recibo em PDF**.
- [x] **Relatório do estoque em PDF**.
- [x] **Histórico geral** de movimentações por dia, com faturamento do dia.
- [x] **Filtros de período** no histórico (hoje / 7 / 30 dias) com total vendido.
- [x] **Avisos** quando um produto acaba ou fica abaixo do mínimo após uma saída.
- [x] **Login com um toque** (nome opcional, sem senha).
- [x] **Acessibilidade**: modo de fonte grande.

---

## 🔜 Curto prazo (alto valor, baixo esforço)

- [ ] **Editar a quantidade direto no cadastro** com confirmação (hoje é só por
      movimentação, de propósito — mas pode ser uma opção rápida).

---

## 🌐 Médio prazo

- [ ] **Sincronização na nuvem** (ex: [Supabase](https://supabase.com) ou Firebase):
      compartilhar o mesmo estoque entre celular e computador, com backup
      automático. Exigiria:
  - Trocar a camada `lib/db.ts` por chamadas à API (mantendo a mesma interface).
  - Autenticação real (substituir o `"tempToken"`).
- [ ] **Service worker** para funcionamento 100% offline (inclusive o
      carregamento), com `next-pwa` ou Workbox.
- [ ] **Múltiplos usuários / funcionários**, cada um com seu acesso.

---

## 💡 Longo prazo / ideias

- [ ] **Leitor de código de barras** pela câmera do celular para achar produtos.
- [ ] **Gráficos** de produtos que mais saem, valor de estoque ao longo do tempo.
- [ ] **Controle de fornecedores** (cadastro próprio, contatos).
- [ ] **Modo "venda rápida"**: registrar várias saídas de uma vez (carrinho).
- [ ] **Tema escuro** (as variáveis de cor já existem em `globals.css`).

---

## 🧹 Dívidas técnicas / limpeza

- [ ] Remover arquivos não usados que vieram do template (`public/next.svg`,
      `public/vercel.svg`, `components/ui/toaster.tsx` e `hooks/use-toast.ts` se
      ficarmos só com o `sonner`).
- [ ] Corrigir o link "Esqueci a senha" da tela de login (rota inexistente) ou
      implementá-la.
- [ ] Adicionar testes automatizados dos `services` (regras de estoque).
