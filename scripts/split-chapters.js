/**
 * split-chapters.js
 * Divide o MD principal em capítulos, distribui as imagens
 * proporcionalmente e gera content/chapters/ + content/index.json
 */

const fs   = require('fs')
const path = require('path')

// ── Configuração dos capítulos (detectados no documento) ───────────────────
// Formato: { slug, title, startLine (0-based), number }
// As linhas foram detectadas com Get-Content | Select-String
const CHAPTER_DEFS = [
  { number: 0,  slug: 'capa',              title: 'Apresentação',               startLine: 0 },
  { number: 1,  slug: 'historia-mergulho', title: 'História do Mergulho',        startLine: 20 },
  { number: 2,  slug: 'certificadoras',    title: 'Certificadoras',              startLine: 220 },
  { number: 3,  slug: 'equipamentos',      title: 'Equipamentos',                startLine: 266 },
  { number: 4,  slug: 'fisica-mergulho',   title: 'Física Aplicada ao Mergulho', startLine: 784 },
  { number: 5,  slug: 'fisiologia',        title: 'Fisiologia do Mergulho',      startLine: 1288 },
  { number: 6,  slug: 'tabelas-descomp',   title: 'Tabelas de Descompressão',    startLine: 2839 },
  { number: 7,  slug: 'procedimentos',     title: 'Procedimentos, Técnica e Sinais', startLine: 3141 },
  { number: 8,  slug: 'animais-marinhos',  title: 'Animais Marinhos',            startLine: 3437 },
]

// Ícones por capítulo (emoji para os cards)
const ICONS = ['📋','⚓','🏅','🤿','🔬','🫁','📊','🤙','🐠']

// Breve descrição de cada capítulo
const DESCRIPTIONS = [
  'Nota introdutória e ficha do manual.',
  'A história do mergulho desde a Antiguidade até o mergulho moderno.',
  'Entidades certificadoras de mergulho no Brasil e no mundo.',
  'Equipamentos essenciais: máscara, roupa, cilindro, regulador, BCD e acessórios.',
  'Física da água: pressão, empuxo, luz, som e temperatura no ambiente subaquático.',
  'Efeitos do mergulho no organismo: barotraumas, narcose, doença descompressiva.',
  'Uso correto das tabelas de descompressão USN e BSAC.',
  'Técnicas de mergulho, planejamento e sinais manuais.',
  'Animais marinhos perigosos e condutas de segurança.',
]

const ROOT     = path.join(__dirname, '..')
const MAIN_MD  = path.join(ROOT, 'content', 'raw', 'curso_mergulho_autonomo_basico.md')
const CHAPTERS_DIR = path.join(ROOT, 'public', 'content', 'chapters')
const INDEX_OUT    = path.join(ROOT, 'public', 'content', 'index.json')
const IMG_BASE     = '/assets/content/curso_mergulho_autonomo_basico/img'
const IMG_DIR      = path.join(ROOT, 'public', 'assets', 'content', 'curso_mergulho_autonomo_basico', 'img')

// ── Ler arquivo principal ──────────────────────────────────────────────────
const raw   = fs.readFileSync(MAIN_MD, 'utf8')
const lines = raw.split('\n')

// ── Listar imagens disponíveis ─────────────────────────────────────────────
const allImages = fs.readdirSync(IMG_DIR)
  .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
  .sort()

console.log(`Total de imagens: ${allImages.length}`)

// ── Calcular limites de cada capítulo ─────────────────────────────────────
// A seção "## Imagens" começa onde terminam os capítulos
const IMAGE_SECTION_LINE = lines.findIndex(l => l.trim() === '## Imagens')
const END_CONTENT = IMAGE_SECTION_LINE > 0 ? IMAGE_SECTION_LINE : lines.length

const chapters = CHAPTER_DEFS.map((def, i) => {
  const nextStart = i + 1 < CHAPTER_DEFS.length
    ? CHAPTER_DEFS[i + 1].startLine
    : END_CONTENT
  return { ...def, endLine: nextStart }
})

// ── Distribuir imagens proporcionalmente ──────────────────────────────────
const totalLines = chapters.reduce((s, c) => s + (c.endLine - c.startLine), 0)
let imgIndex = 0
const chapImages = chapters.map(c => {
  const proportion = (c.endLine - c.startLine) / totalLines
  const count = Math.round(allImages.length * proportion)
  const slice = allImages.slice(imgIndex, imgIndex + count)
  imgIndex += count
  return slice
})
// Restantes vão para o último capítulo
if (imgIndex < allImages.length) {
  chapImages[chapImages.length - 1].push(...allImages.slice(imgIndex))
}

// ── Criar diretório de capítulos ───────────────────────────────────────────
if (!fs.existsSync(CHAPTERS_DIR)) fs.mkdirSync(CHAPTERS_DIR, { recursive: true })

// ── Gerar arquivos MD por capítulo ────────────────────────────────────────
const indexItems = []

chapters.forEach((chap, i) => {
  const bodyLines = lines.slice(chap.startLine, chap.endLine)
  // Limpar linhas de frontmatter (só no cap 0)
  const cleanBody = bodyLines
    .join('\n')
    .replace(/^---[\s\S]*?---\n?/, '')  // remove frontmatter se presente
    .trim()

  // Montar bloco de imagens do capítulo
  const imgBlock = chapImages[i].length > 0
    ? '\n\n---\n\n' + chapImages[i]
        .map(img => `![Figura do capítulo ${chap.number}](${IMG_BASE}/${img})`)
        .join('\n\n')
    : ''

  // Extrair um excerpt limpo (primeiros 200 chars sem artefatos)
  const excerptRaw = cleanBody
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[^\x20-\x7EÀ-ÿ\n]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)

  // Frontmatter do capítulo
  const frontmatter = `---
id: "${chap.slug}"
moduleId: "curso_mergulho_autonomo_basico"
title: "${chap.title}"
number: ${chap.number}
---
`
  const finalMd = frontmatter + '\n' + cleanBody + imgBlock

  const filename = `cap-${String(chap.number).padStart(2,'0')}-${chap.slug}.md`
  fs.writeFileSync(path.join(CHAPTERS_DIR, filename), finalMd, 'utf8')
  console.log(`✓ ${filename}  (${chapImages[i].length} imagens)`)

  indexItems.push({
    id:          chap.slug,
    moduleId:    'curso_mergulho_autonomo_basico',
    filename,
    number:      chap.number,
    title:       chap.title,
    description: DESCRIPTIONS[i] ?? '',
    icon:        ICONS[i] ?? '📄',
    excerpt:     excerptRaw,
    imageCount:  chapImages[i].length,
  })
})

// ── Escrever index.json ────────────────────────────────────────────────────
const index = {
  version: '2.0',
  modules: [
    {
      id:       'curso_mergulho_autonomo_basico',
      title:    'Manual de Mergulho Autônomo Desportivo',
      subtitle: 'Guarda-Vidas — Defesa Civil Maricá',
      tags:     ['mergulho', 'busca-e-resgate', 'guarda-vidas'],
      chapters: indexItems,
    }
  ],
  // mantém compatibilidade com código que usa items[]
  items: indexItems.map(c => ({
    id:      `${c.moduleId}/${c.id}`,
    title:   c.title,
    excerpt: c.excerpt,
    tags:    ['mergulho'],
  }))
}

fs.writeFileSync(INDEX_OUT, JSON.stringify(index, null, 2), 'utf8')
console.log(`\n✅ index.json atualizado — ${indexItems.length} capítulos`)
