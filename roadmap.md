# Roadmap — Curso de Mergulho DCM (PWA Estático)

> **Projeto:** Central de Inteligência interativa para o curso de Mergulho de Busca e Resgate — Guarda-Vidas da Defesa Civil Maricá.
> **Deploy:** https://evalente82.github.io/Curso-Mergulho-DCM/
> **Stack:** React 18 + Vite 5 + TypeScript + Tailwind CSS + Framer Motion + Vite PWA (Workbox)
> **Última atualização:** 2026-05-03

---

## ✅ O que está FEITO

### Fase 1 — Infraestrutura & DevOps
- [x] Scaffold Vite + React + TypeScript + Tailwind CSS
- [x] Design System ocean + ink mapeado no tailwind.config.js
- [x] Workflow CI/CD GitHub Actions (build + deploy GitHub Pages automático)
- [x] Tipografia de leitura com fonte serifada (Georgia) customizada
- [x] Variáveis CSS de cores e espaçamento centralizadas

### Fase 2 — PWA & Offline-First
- [x] vite-plugin-pwa (Workbox) configurado com cache dinâmico
- [x] manifest.webmanifest gerado automaticamente pelo Vite em build (sem BOM, sem erro de sintaxe)
- [x] Ícones PWA (192px e 512px) com identidade visual do projeto
- [x] offline.html de fallback — nunca exibe o dinossauro do Chrome
- [x] Estratégia CacheFirst para assets e NetworkFirst para conteúdo
- [x] App instalável em iOS/Android como app nativo (sem barra do browser)

### Fase 3 — Engenharia de Conteúdo
- [x] PDF extraído com pdftotext (variante UTF-8 selecionada automaticamente)
- [x] Raw preservado em content/raw/curso_mergulho_autonomo_basico.md
- [x] scripts/split-chapters.js — divide raw em 9 capítulos individuais
- [x] scripts/sync-images-from-raw.js — lê marcadores [nome.jpg] do raw e injeta nos capítulos com ancoragem por texto
- [x] scripts/remove-chapter-images.js — reset de imagens dos capítulos
- [x] public/content/index.json — índice tipado de módulos e capítulos
- [x] 9 capítulos publicados: Capa, História, Certificadoras, Equipamentos, Física, Fisiologia, Tabelas de Descompressão, Procedimentos, Animais Marinhos
- [x] 85+ imagens extraídas do PDF, nomeadas semanticamente e sincronizadas:
  - História do Mergulho: 3 imagens OK
  - Equipamentos: 6 imagens (01/02/03 em ordem correta) OK
  - Física do Mergulho: 23 imagens OK
  - Fisiologia: 2 imagens OK
  - cap-06/07/08: assets disponíveis, aguardando marcação no raw

### Fase 4 — UI/UX & Motor de Leitura
- [x] Dashboard ModuleDashboard — grid de cards com 9 capítulos
- [x] ChapterReader completo:
  - Barra de progresso de leitura no topo (cross-browser via getBoundingClientRect)
  - Mini-barra de % lido visível em mobile e desktop
  - TOC hierárquico lateral (desktop) e drawer deslizante (mobile)
  - Navegação Anterior/Próximo com animação direcional (Framer Motion)
  - Controle de tamanho de fonte (+/-)
  - Modo fullscreen
  - Proteção de conteúdo (sem copiar, sem imprimir, sem arrastar imagens)
- [x] preprocessMarkdown() — remove marcadores órfãos [nome.jpg], converte títulos PDF em headings ##/###
- [x] TocPanel hierárquico com árvore visual, indentação por nível, item ativo destacado
- [x] Blocos pre indentados renderizados como parágrafo itálico (não caixa de código)
- [x] Tabelas com scroll horizontal isolado
- [x] Imagens centralizadas + suporte a float-right via alt=float-right
- [x] Navbar sticky com menu hamburger mobile + animação suave

### Fase 5 — Busca Full-Text
- [x] ContentSearch com FlexSearch (tokenize forward, cache ativado)
- [x] Índice construído client-side a partir do index.json (funciona offline)
- [x] Resultados animados com Framer Motion
- [x] Busca assertiva — navega com ?q=termo na URL ao clicar no resultado
- [x] ChapterReader lê ?q=, localiza o primeiro parágrafo/elemento com o termo:
  - scrollIntoView({ block: center }) até o trecho exato
  - Highlight amarelo com fade-out em 3 segundos (animação search-pulse)

---

## Em andamento / Parcialmente feito

- [ ] Imagens dos capítulos 06/07/08 — assets existem mas marcadores [nome.jpg] nao inseridos no raw:
  - cap-06-tabelas-descomp.md — ~11 imagens disponíveis
  - cap-07-procedimentos.md — ~2 imagens disponíveis
  - cap-08-animais-marinhos.md — ~9 imagens disponíveis
- [ ] Pasta content/chapters/ na raiz é duplicata de public/content/chapters/ — pode ser removida

---

## O que FALTA (Backlog Priorizado)

### Alta prioridade

| # | Tarefa | Detalhes |
|---|--------|----------|
| 1 | Marcar imagens cap-06/07/08 no raw | Inserir [nome.jpg] no raw, rodar sync, testar, commitar |
| 2 | Progresso de leitura persistido | Salvar localStorage com chapterId+progress+lastRead, mostrar % no dashboard |
| 3 | Bookmarks / marcadores | Usuário marca parágrafo, ícone de favorito no TOC sidebar |
| 4 | Highlights pessoais | Usuário seleciona texto, salva highlight amarelo persistente (localStorage) |

### Média prioridade

| # | Tarefa | Detalhes |
|---|--------|----------|
| 5 | Busca semântica (RAG-ready) | Embeddings com @xenova/transformers em build-time, similaridade coseno client-side |
| 6 | Tira-dúvidas IA | Modal com pergunta contextualizada ao capítulo atual via OpenAI/Gemini |
| 7 | Modo escuro | Toggle dark/light com prefers-color-scheme e persistência |
| 8 | Notificações push | Service worker + Web Push para lembretes de revisão |
| 9 | Animais marinhos interativos | Card expansível por animal com imagem, perigo e socorro |

### Baixa prioridade / Futuro

| # | Tarefa | Detalhes |
|---|--------|----------|
| 10 | Backend .NET 8 | Web API com DDD/CQRS para progresso sincronizado entre dispositivos |
| 11 | Autenticação | Login simples JWT para guardar progresso na nuvem |
| 12 | Modo quiz | Perguntas geradas automaticamente do conteúdo de cada capítulo |
| 13 | Notas de margem | Anotação textual ancorada a um parágrafo |
| 14 | Analytics offline | Registro de sessões de leitura (tempo por capítulo, abandono) |

---

## Estado visual do site (funcionalidades existentes)

Publicado em https://evalente82.github.io/Curso-Mergulho-DCM/ — PWA instalável em iOS/Android.

### Página inicial (Home /)
Hero section com fundo azul oceano em gradiente, título grande e botão de destaque Ler Apostila. Navbar sticky com blur backdrop, logo com ícone de ondas (Lucide) e links Início e Busca. Em mobile aparece o ícone hamburger que abre um menu deslizante animado.

### Página de Busca (/busca)
Campo de pesquisa com ícone de lupa e foco automático. Conforme o usuário digita, resultados aparecem com animação de entrada suave. Cada card mostra título do capítulo e trecho de contexto. Ao clicar, o leitor abre e rola automaticamente até o parágrafo exato onde a palavra aparece, com highlight amarelo pulsante que some em 3 segundos. Funciona 100% offline pois o índice é construído client-side.

### Dashboard do Módulo (/modulo/:id)
Grid de cards dos 9 capítulos com ícone emoji, número, título e trecho descritivo. Cards com hover de sombra elevada. Layout responsivo: 1 coluna (mobile), 2 colunas (tablet), 3 colunas (desktop). Transição de página com fade+slide Framer Motion.

### Leitor de Capítulo (/modulo/:id/:chapId)

- Barra de progresso fina no topo absoluto da tela (ocean-500) avança com a leitura. Funciona via getBoundingClientRect, nunca trava em 0%.
- Toolbar sticky abaixo da navbar: botão Capítulos (volta ao dashboard), botão Índice (abre TOC), indicador XX% lido com mini-barra, controles de tamanho de fonte (13-26px), botão de tela cheia.
- TOC lateral (desktop lg+): árvore hierárquica — nível 1 negrito, nível 2 com bolinha, nível 3 com seta. Item visível na tela destacado em azul via IntersectionObserver.
- TOC drawer (mobile): painel desliza da esquerda com spring animation. Fundo escurecido fecha ao clicar fora.
- Artigo de leitura: tipografia serifada Georgia, espaçamento 1.85, texto fluido. Títulos com hierarquia visual. Imagens centralizadas com bordas arredondadas e sombra. Tabelas com scroll horizontal isolado. Blocos indentados do PDF como parágrafo itálico (não caixa de código escura).
- Navegação Anterior/Próximo no rodapé com animação direcional (slide left/right conforme direção).
- Modo fullscreen: navbar some, artigo ocupa tela inteira.
- Proteção de conteúdo: seleção bloqueada, cópia bloqueada via onCopy, impressão bloqueada com mensagem de direitos autorais via @media print.

---

## Scripts do Projeto

| Script | Comando | Descrição |
|--------|---------|-----------|
| Dividir capítulos | node scripts/split-chapters.js | Lê o raw MD e (re)gera os 9 capítulos |
| Sincronizar imagens | node scripts/sync-images-from-raw.js | Lê [nome.jpg] do raw e injeta nas posições corretas |
| Remover imagens | node scripts/remove-chapter-images.js | Remove todas as imagens dos capítulos (reset) |
| Dev server | npm run dev | Inicia em localhost:5173 (ou 5174 se ocupada) |
| Build prod | npm run build | Gera dist/ com PWA completo |

---

## Regras de Ouro

### Encoding UTF-8 — NUNCA use PowerShell para salvar .md
O PowerShell 5.1 corrompe UTF-8 como Windows-1252.
SEMPRE use Node.js: fs.writeFileSync(filePath, content, utf8)

### Fluxo de inserção de imagens
1. Editar content/raw/curso_mergulho_autonomo_basico.md — inserir [nome_imagem.ext] na linha exata
2. Rodar: node scripts/sync-images-from-raw.js
3. Testar: npm run dev
4. git add public/content/chapters/ && git commit && git push

### Commits
- Só commitar quando o usuário pedir
- Mensagem semântica: feat(...), fix(...), chore(...)