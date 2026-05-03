# Roadmap de Desenvolvimento — Curso de Mergulho DCM (PWA Estático)

Data: 2026-05-02

Resumo rápido
------------
- Projeto: PWA estático para servir como curso/manual de Mergulho de Busca e Resgate (Guarda-Vidas - Defesa Civil Maricá).
- Objetivo: app móvel-first, offline-first, com conteúdo das apostilas preservado na íntegra (proibido resumir/alterar o texto original).

Status atual
------------
- Repositório inicializado e commit inicial criado.
- Remote `origin` adicionado e `main` empurrada para https://github.com/evalente82/Curso-Mergulho-DCM.git
- Roadmap técnico gerado e registrado (este arquivo).

Fases do roadmap
-----------------

Fase 1 — Setup Base e Infraestrutura DevOps
- Objetivo: Scaffold Vite + React + TypeScript, Tailwind e ferramentas de UI/UX.
- Status: pendente (scaffold pronto para ser gerado). 
- Ações imediatas (comandos PowerShell):

```powershell
# criar app Vite + TS
npm create vite@latest . -- --template react-ts

# instalar dependências
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion lucide-react clsx vite-plugin-pwa flexsearch

# libs utilitárias
npm install axios dayjs
npm i -D @types/dayjs
```

Fase 2 — Arquitetura do PWA e Resiliência Offline
- Objetivo: manifest.json e service worker (Vite PWA / Workbox).
- Status: não iniciado.
- Notas: precache de `/content` e assets críticos; cache-first para conteúdo estático; network-first para atualizações.

Fase 3 — Engenharia do Conteúdo Estático
- Objetivo: converter as apostilas para MD + metadados JSON tipado, preservando fidelidade.
- Status: não iniciado.
- Esquema sugerido (tipos TypeScript):

```ts
type ContentItem = {
  id: string
  title: string
  authors?: string[]
  sourceFile: string
  tags?: string[]
  publishedAt?: string
}
```

- Observação: MD originais devem ser preservados em `/content/raw` e o índice derivado em `content/index.json`.

Fase 4 — UI/UX e Motor de Leitura
- Objetivo: Dashboard exploratório, reader em modo de foco e busca full-text client-side.
- Status: não iniciado.
- Recomendação de motor de busca: FlexSearch, índice gerado em build-time e serializado para import no client.

Checklist de Acessibilidade & Resiliência
----------------------------------------
- Conteúdo visitado deve funcionar 100% offline.
- Fallback: `offline.html` com acesso à busca local.
- Respeitar prefer-reduced-motion.
- Leitores de tela (aria-labels, landmarks, headings corretos).

Próximos passos (curto prazo)
-----------------------------
1. Autorizar scaffold inicial para eu criar os arquivos do projeto (package.json, vite.config.ts, tailwind.config.js, scripts e workflow CI).
2. Rodar `scripts/build-content.ts` esqueleto para gerar `content/index.json` a partir de `/content/raw` (a conversão real dos PDFs/apostilas é passo manual/externo e deverá ser colocada em `/content/raw`).
3. Configurar Vite PWA com precache dos MD e imagens críticas.

Notas finais
-----------
Este roadmap é documento vivo e deve ser atualizado a cada PR que alterar o escopo ou adicionar artefatos (ex: workflow CI, scripts de conversão). Se autorizar, inicio o scaffold agora e commito as mudanças em `main`.
