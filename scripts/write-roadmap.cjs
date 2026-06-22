// Script auxiliar — reescreve o roadmap.md com encoding correto
const fs = require('fs')
const path = require('path')

const content = `# Roadmap — Curso de Mergulho DCM (PWA Estático)

> **Projeto:** Central de Inteligência interativa para o curso de Mergulho de Busca e Resgate — Guarda-Vidas da Defesa Civil Maricá.
> **Deploy:** https://evalente82.github.io/Curso-Mergulho-DCM/
> **Stack:** React 18 + Vite 5 + TypeScript + Tailwind CSS + Framer Motion + Vite PWA (Workbox)
> **Última atualização:** 2026-05-05

---

## ✅ O que está FEITO

### Fase 1 — Infraestrutura & DevOps
- [x] Scaffold Vite + React + TypeScript + Tailwind CSS
- [x] Design System ocean + ink mapeado no tailwind.config.js
- [x] Workflow CI/CD GitHub Actions (build + deploy GitHub Pages automático)
- [x] Tipografia de leitura com fonte serifada (Georgia) customizada
- [x] Variáveis CSS de cores e espaçamento centralizadas
- [x] \`.gitattributes\` com \`eol=lf\` — previne bug de commits vazios no Windows (\`core.autocrlf\`)

### Fase 2 — PWA & Offline-First
- [x] vite-plugin-pwa (Workbox) configurado com cache dinâmico
- [x] manifest.webmanifest gerado automaticamente pelo Vite em build (sem BOM, sem erro de sintaxe)
- [x] Ícones PWA (192px e 512px) com identidade visual do projeto
- [x] offline.html de fallback — nunca exibe o dinossauro do Chrome
- [x] Estratégia **NetworkFirst** (5s timeout) para \`.md\` e \`index.json\` — F5 sempre busca versão nova
- [x] Estratégia **StaleWhileRevalidate** para imagens — carregamento rápido + atualização em background
- [x] App instalável em iOS/Android como app nativo (sem barra do browser)

### Fase 3 — Engenharia de Conteúdo
- [x] PDF extraído com pdftotext (variante UTF-8 selecionada automaticamente)
- [x] Raw arquivado em \`content/archive/curso_mergulho_autonomo_basico.ORIGINAL.md\`
- [x] scripts/split-chapters.js — divide raw em 9 capítulos individuais
- [x] scripts/sync-images-from-raw.js — lê marcadores [nome.jpg] do raw e injeta nos capítulos
- [x] scripts/remove-chapter-images.js — reset de imagens dos capítulos
- [x] scripts/fix-image-refs.py — converteu 34 referências de imagem do formato PDF para Markdown
- [x] public/content/index.json — índice tipado de módulos e capítulos
- [x] 9 capítulos publicados: Capa, História, Certificadoras, Equipamentos, Física, Fisiologia, Tabelas de Descompressão, Procedimentos, Animais Marinhos
- [x] 85+ imagens extraídas do PDF, nomeadas semanticamente e sincronizadas

### Fase 4 — UI/UX & Motor de Leitura
- [x] Dashboard ModuleDashboard — grid de cards com 9 capítulos
- [x] ChapterReader completo (barra de progresso, mini-barra, TOC, navegação, fonte, fullscreen, proteção)
- [x] preprocessMarkdown() — remove marcadores órfãos [nome.jpg], converte títulos PDF em headings
- [x] TocPanel hierárquico com marcadores visuais por nível:
  - H1 = quadrado azul (título principal)
  - H2 = bolinha + label "Seção" (seção do capítulo)
  - H3 = seta + label "Sub" (subseção)
  - Contador de itens no cabeçalho do índice
  - Banner de dica quando capítulo tem poucas seções (orienta uso de ## e ###)
- [x] Blocos pre indentados como parágrafo itálico, tabelas com scroll horizontal isolado
- [x] Imagens centralizadas + suporte a float-right via alt=float-right
- [x] Navbar sticky com menu hamburger mobile + animação suave

### Fase 5 — Busca Full-Text
- [x] ContentSearch com FlexSearch (tokenize forward, cache ativado)
- [x] Índice construído client-side a partir do index.json (funciona offline)
- [x] **Busca normalizada** — sem acento, sem maiúscula/minúscula:
  - ex: "fisiologia" encontra "Fisiologia do Mergulho"
  - ex: "pulmao" encontra "Pulmão"
  - Função \`normalize(text)\` aplica NFD + remoção de diacríticos antes de indexar e buscar
- [x] Resultados animados com Framer Motion
- [x] Busca assertiva — navega com \`?q=termo\` na URL ao clicar no resultado
- [x] ChapterReader lê \`?q=\`, localiza elemento com comparação normalizada e:
  - scrollIntoView({ block: center }) até o trecho exato
  - Highlight amarelo com fade-out em **5 segundos** (animação search-pulse)

### Fase 6 — CMS (Sveltia CMS)
- [x] Sveltia CMS integrado em /admin com OAuth via Cloudflare Workers
- [x] GitHub OAuth App Client ID: \`Ov23lisahkV7awutv0C1\`
- [x] Worker Cloudflare: \`https://dcm-admin-mergulho.endrigo-valente.workers.dev\`
- [x] Repositório do worker: \`evalente82/dcm-admin-mergulho\`
- [x] Campos do CMS: título, id, moduleId (hidden), number, body (markdown)
- [x] Hint no campo body explica que \`##\` e \`###\` viram entradas no índice lateral
- [x] local_backend comentado — ativo apenas em desenvolvimento local
- [x] Decap CMS versão fixada: \`3.3.3\` (sem auto-update que quebra encoding)

---

## Em andamento / Parcialmente feito

- [ ] Imagens dos capítulos 06/07/08 — assets existem mas marcadores não inseridos:
  - cap-06-tabelas-descomp.md — ~11 imagens disponíveis
  - cap-07-procedimentos.md — ~2 imagens disponíveis
  - cap-08-animais-marinhos.md — ~9 imagens disponíveis

---

## O que FALTA (Backlog Priorizado)

### Alta prioridade

| # | Tarefa | Detalhes |
|---|--------|----------|
| 1 | Marcar imagens cap-06/07/08 | Inserir [nome.jpg] no raw, rodar sync, testar, commitar |
| 2 | Progresso de leitura persistido | Salvar localStorage com chapterId+progress+lastRead, mostrar % no dashboard |
| 3 | Bookmarks / marcadores | Usuário marca parágrafo, ícone de favorito no TOC sidebar |
| 4 | Highlights pessoais | Usuário seleciona texto, salva highlight amarelo persistente |

### Média prioridade

| # | Tarefa | Detalhes |
|---|--------|----------|
| 5 | Busca semântica (RAG-ready) | Embeddings com @xenova/transformers em build-time, similaridade coseno |
| 6 | Tira-dúvidas IA | Modal com pergunta contextualizada ao capítulo via OpenAI/Gemini |
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

## ⚠️ Configuração Crítica — NÃO ALTERAR

### Git — linha de fim de arquivo
- **\`.gitattributes\`** força \`eol=lf\` para TODOS os arquivos de texto (comprometido em \`c4b9e51\`)
- \`core.autocrlf=false\` + \`core.eol=lf\` obrigatórios em qualquer máquina Windows
- **Motivo:** Sveltia CMS salva sempre com LF. Windows converte para CRLF → git não detecta diff → commits vazios → deploy sem mudanças
- **Comando de configuração:** \`git config core.autocrlf false && git config core.eol lf\`

### Dependências fixadas — NÃO atualizar

| Pacote | Versão exata | Motivo do freeze |
|--------|-------------|-----------------|
| \`remark-gfm\` | \`3.0.1\` | v4.x incompatível com react-markdown@8 → crash \`TypeError: Cannot read properties of undefined (reading 'inTable')\` |
| Decap CMS (CDN) | \`3.3.3\` | Auto-update pode quebrar encoding UTF-8 dos títulos |

### PWA — estratégias Workbox (vite.config.ts)

| Recurso | Estratégia | Por quê |
|---------|-----------|---------|
| \`/content/chapters/*.md\` | NetworkFirst (5s) | Conteúdo muda via CMS → sempre pegar versão nova |
| \`/content/index.json\` | NetworkFirst (5s) | Metadados de capítulos podem mudar |
| Imagens \`/assets/content/**\` | StaleWhileRevalidate | Serve cache primeiro, atualiza em background |
| Assets JS/CSS/fontes | CacheFirst | Versionados por hash → nunca mudam |

### Fluxo CMS confirmado (≈ 4 min do save ao site atualizado)

\`\`\`
Edit no Sveltia CMS → Save
→ Commit real no GitHub (arquivo .md modificado com mudança real)
→ CI GitHub Actions: fix-encoding em memória (sem push de volta) → npm run build → deploy Pages
→ ~4 minutos → site atualizado
→ F5 (NetworkFirst 5s) busca versão nova automaticamente
\`\`\`

### Autenticação CMS

| Item | Valor |
|------|-------|
| Provider | Sveltia CMS + GitHub OAuth |
| Worker Cloudflare | \`https://dcm-admin-mergulho.endrigo-valente.workers.dev\` |
| GitHub OAuth App Client ID | \`Ov23lisahkV7awutv0C1\` |
| Repositório do worker | \`evalente82/dcm-admin-mergulho\` |

### Como criar seções no Índice (via CMS ou edição direta do .md)

No editor do admin, use headings markdown no campo "Conteúdo":

\`\`\`markdown
## Título da Seção
Aparece no índice lateral como item principal com marcador azul.

### Subseção
Aparece indentada abaixo da seção pai, com label "Sub".

#### Sub-subseção
Nível mais profundo, texto em itálico no índice.
\`\`\`

---

## Scripts do Projeto

| Script | Comando | Descrição |
|--------|---------|-----------|
| Dividir capítulos | \`node scripts/split-chapters.js\` | Lê o raw MD e (re)gera os 9 capítulos |
| Sincronizar imagens | \`node scripts/sync-images-from-raw.js\` | Lê [nome.jpg] do raw e injeta nas posições corretas |
| Remover imagens | \`node scripts/remove-chapter-images.js\` | Remove todas as imagens dos capítulos (reset) |
| Corrigir refs de imagem | \`python scripts/fix-image-refs.py\` | Converte [nome.png] para ![nome](path) — já executado |
| Dev server | \`npm run dev\` | Inicia em localhost:5173 |
| Build prod | \`npm run build\` | Gera dist/ com PWA completo |

---

## Regras de Ouro

### Encoding UTF-8 — NUNCA use PowerShell para salvar .md
O PowerShell 5.1 (Windows) corrompe UTF-8 como Windows-1252.
SEMPRE use Node.js: \`fs.writeFileSync(filePath, content, 'utf8')\`

### Fluxo de inserção de imagens nos capítulos
1. Editar \`content/archive/curso_mergulho_autonomo_basico.ORIGINAL.md\` — inserir \`[nome_imagem.ext]\` na linha exata
2. Rodar: \`node scripts/sync-images-from-raw.js\`
3. Testar: \`npm run dev\`
4. \`git add public/content/chapters/ && git commit && git push\`

### Commits
- Só commitar quando o usuário pedir
- Mensagem semântica: \`feat(...)\`, \`fix(...)\`, \`chore(...)\`
`

const dest = path.join(__dirname, '..', 'roadmap.md')
fs.writeFileSync(dest, content, 'utf8')
console.log('roadmap.md atualizado com sucesso')
