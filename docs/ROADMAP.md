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
- [x] **Gráficos**: produtos mais vendidos e vendas por dia (acessível pelo Histórico).
- [x] **Conveniências**: duplicar produto, editar a quantidade no cadastro
      (registra ajuste) e ordenar a lista (atenção, nome, estoque, mais vendidos).
- [x] **Favoritos**: fixar produtos no topo da lista.
- [x] **Enviar a lista de reposição no WhatsApp** (mensagem pronta).
- [x] **Tema escuro**.
- [x] **Conferência de estoque** (contagem guiada item a item).
- [x] **Busca por voz** na tela inicial.
- [x] **Arquivar produtos** (inativos): saem das listas, mantêm o histórico.
- [x] **Funciona offline de verdade** (service worker abre o app sem internet).
- [x] **Categorias personalizadas** (criar as suas próprias no cadastro).
- [x] **Gráfico de valor em estoque por categoria**.
- [x] **Clientes e vendas detalhadas**: preço editável por item (preço volátil),
      desconto (R$/%), cliente, e histórico de vendas com total por cliente.
- [x] **Identidade visual**: cor verde da marca, cabeçalhos com gradiente,
      ícones por categoria (🍎🥬🥕) e borda colorida por situação do estoque.
- [x] **Fiado/pagamento**: venda paga ou a prazo, com "a receber" por cliente
      e "marcar pago".
- [x] **Devolução**: registrar retorno de mercadoria ao estoque.
- [x] **Venda por unidade alternativa** (ex: caixa ou kg) com conversão na baixa
      do estoque.
- [x] **Lucro/margem**: lucro do dia e do período (faturamento − custo).
- [x] **Página de clientes**: total comprado, quanto está devendo, adicionar/remover.
- [x] **Relatório de vendas em PDF** (período, com vendido, lucro e a receber).
- [x] **Backup completo** (produtos, movimentações, clientes, vendas e categorias).

---

## 🔜 Curto prazo (alto valor, baixo esforço)

- [ ] **Imprimir etiqueta/preço** de um produto.
- [ ] **Aviso diário** dos itens que precisam repor (notificação no celular).

---

## 🌐 Médio prazo

- [ ] **Sincronização na nuvem** (ex: [Supabase](https://supabase.com) ou Firebase):
      compartilhar o mesmo estoque entre celular e computador, com backup
      automático. Exigiria:
  - Trocar a camada `lib/db.ts` por chamadas à API (mantendo a mesma interface).
  - Autenticação real (substituir o `"tempToken"`).
- [ ] **Múltiplos usuários / funcionários**, cada um com seu acesso.

---

## 💡 Longo prazo / ideias

- [ ] **Leitor de código de barras** pela câmera do celular para achar produtos.
- [ ] **Mais gráficos**: valor de estoque ao longo do tempo, margem de lucro.
- [ ] **Controle de fornecedores** (cadastro próprio, contatos).

---

## 🧹 Dívidas técnicas / limpeza

- [ ] Remover arquivos não usados que vieram do template (`public/next.svg`,
      `public/vercel.svg`, `components/ui/toaster.tsx` e `hooks/use-toast.ts` se
      ficarmos só com o `sonner`).
- [ ] Corrigir o link "Esqueci a senha" da tela de login (rota inexistente) ou
      implementá-la.
- [ ] Adicionar testes automatizados dos `services` (regras de estoque).
