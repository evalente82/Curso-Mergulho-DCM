# 🌊 Curso de Mergulho Autônomo Básico — DCM

[![Deploy](https://github.com/evalente82/Curso-Mergulho-DCM/actions/workflows/deploy.yml/badge.svg)](https://github.com/evalente82/Curso-Mergulho-DCM/actions/workflows/deploy.yml)

## 🔗 Acesse o site

**[https://evalente82.github.io/Curso-Mergulho-DCM/](https://evalente82.github.io/Curso-Mergulho-DCM/)**

> Funciona em qualquer dispositivo — celular, tablet e computador.
> Pode ser instalado como app (PWA) diretamente pelo navegador.

---

## 🎯 Objetivo

Disponibilizar o material técnico do **Curso de Mergulho Autônomo Básico** da **Defesa Civil Maricá** em uma plataforma digital moderna, acessível e offline-first — eliminando a dependência de apostilas físicas e permitindo que Guarda-Vidas e equipes de Busca e Resgate estudem de qualquer lugar, a qualquer hora, sem precisar de internet.

---

## 📋 Finalidade

Esta plataforma foi desenvolvida para uso **interno da Defesa Civil Maricá** com os seguintes propósitos:

- 📖 **Centralizar o conteúdo** do curso em um único ambiente digital organizado por capítulos
- 📲 **Acesso offline** — o conteúdo acessado uma vez fica disponível sem internet (PWA/Service Worker)
- 🔍 **Busca rápida** no conteúdo da apostila para consultas durante operações
- 🔒 **Proteção do conteúdo** — sem cópia, sem impressão, sem download não autorizado
- 📱 **Multi-dispositivo** — experiência nativa em iOS, Android e Desktop

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Estilo | Tailwind CSS + Framer Motion |
| PWA | Vite PWA (Workbox) |
| Deploy | GitHub Pages via GitHub Actions (CI/CD) |
| Ícones | Lucide React |

---

## 🚀 Desenvolvimento local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:5173/

# Verificar tipos
npm run typecheck

# Build de produção
npm run build
```

---

## 📁 Scripts de conteúdo

```bash
# Divide o arquivo raw em capítulos
node scripts/split-chapters.js

# Sincroniza marcadores de imagem [img.jpg] do raw para os capítulos
node scripts/sync-images-from-raw.js

# Remove todas as imagens dos capítulos (reset para inserção manual)
node scripts/remove-chapter-images.js
```

> ⚠️ **IMPORTANTE:** Nunca use `Set-Content` ou `Out-File` do PowerShell para editar arquivos `.md`.
> Sempre use Node.js (`fs.writeFileSync(path, content, 'utf8')`) para preservar o encoding UTF-8.

---

## 📦 Estrutura de pastas

```
src/
  app/           → App.tsx (rotas, layout, navbar)
  features/      → Componentes por feature (module, content, search)
  styles.css     → Estilos globais + proteção de conteúdo

public/
  content/
    chapters/    → Capítulos .md gerados automaticamente
    index.json   → Índice de módulos e capítulos
  assets/
    content/
      curso_mergulho_autonomo_basico/img/  → Imagens da apostila

scripts/         → Scripts Node.js para pipeline de conteúdo
content/raw/     → Arquivo fonte da apostila (.md)
```

---

© Defesa Civil Maricá — Conteúdo protegido · Uso interno
