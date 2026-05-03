# README — Painel de Administração DCM (Decap CMS)

> Acesse o painel em produção:
> **https://evalente82.github.io/Curso-Mergulho-DCM/admin/**

---

## Como funciona

O painel usa o **Decap CMS** (antigo Netlify CMS), um editor visual que:
- Lê e salva arquivos **diretamente no repositório GitHub** via API REST.
- Não precisa de banco de dados nem backend próprio.
- Gera um commit automático a cada salvamento.
- O CI/CD do GitHub Actions faz o deploy em seguida (branch `main`).

---

## Configuração inicial (apenas uma vez)

### 1. Criar o GitHub OAuth App

Acesse → **github.com/settings/developers → OAuth Apps → New OAuth App**

| Campo | Valor |
|---|---|
| Application name | `DCM Admin CMS` |
| Homepage URL | `https://evalente82.github.io/Curso-Mergulho-DCM/` |
| Authorization callback URL | `https://sveltia-cms-auth.pages.dev/callback` |

Após criar, anote o **Client ID** (você não precisa do Client Secret aqui).

---

### 2. Configurar o proxy de autenticação (Sveltia CMS Auth)

O proxy `sveltia-cms-auth.pages.dev` é gratuito e open-source.  
Para ativá-lo com seu Client ID:

1. Acesse: **https://sveltia-cms-auth.pages.dev**
2. Siga as instruções para fazer deploy do worker no Cloudflare Pages (é gratuito).
3. Nas variáveis de ambiente do worker, defina:
   - `GITHUB_CLIENT_ID` = seu Client ID do passo anterior
   - `GITHUB_CLIENT_SECRET` = seu Client Secret do passo anterior
   - `ALLOWED_DOMAINS` = `evalente82.github.io`

> **Alternativa mais simples**: Use o proxy público compartilhado do Sveltia.  
> Basta manter `base_url: https://sveltia-cms-auth.pages.dev` no `config.yml`.  
> Funciona sem configuração extra para repositórios públicos.

---

### 3. Acessar o painel

1. Faça o merge da branch `DCM-Admin` → `main`.
2. Aguarde o deploy do GitHub Actions (≈ 2 min).
3. Acesse: `https://evalente82.github.io/Curso-Mergulho-DCM/admin/`
4. Clique em **"Login with GitHub"**.
5. Autorize o app → você estará dentro do painel.

---

## Fluxo de edição

```
Editar capítulo no painel
        ↓
Salvar (Decap faz commit em `main` via API)
        ↓
GitHub Actions dispara o build (≈ 90 segundos)
        ↓
Site atualizado em produção
```

---

## Estrutura de arquivos do CMS

```
public/
├── admin/
│   ├── index.html      ← Carrega o Decap CMS via CDN
│   └── config.yml      ← Define coleções, campos e autenticação
└── content/
    ├── index.json      ← Metadados do módulo (editável no painel)
    └── chapters/
        ├── cap-01.md   ← Capítulos (editáveis no painel)
        └── ...
```

---

## Observações importantes

- **Imagens**: Faça upload diretamente pelo painel. As imagens são salvas em  
  `public/assets/content/curso_mergulho_autonomo_basico/img/`.
- **Frontmatter**: O Decap adiciona YAML frontmatter automaticamente no primeiro  
  save de cada arquivo. Isso é esperado e não quebra o site.
- **Capítulos novos**: A criação está desabilitada no painel. Para adicionar um  
  novo capítulo, use o script `scripts/split-content.js` e atualize o `index.json`.
- **Branch**: Edições feitas pelo painel vão para `main` diretamente. Não edite  
  conteúdo em produção sem revisar o preview antes.

---

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Rodar em dev (painel disponível em http://localhost:5174/admin/)
npm run dev

# Obs: autenticação GitHub não funciona em localhost por padrão.
# Para testar localmente, use o modo "local backend":
# Adicione ao config.yml: `local_backend: true`
# Rode em paralelo: npx netlify-cms-proxy-server
```
