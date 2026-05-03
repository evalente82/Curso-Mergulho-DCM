/**
 * inject-images-precise.js
 *
 * Usa scripts/image-page-map.json (gerado por map-image-pages.js) para
 * inserir cada imagem APÓS o último parágrafo da página correspondente
 * no Markdown do capítulo.
 *
 * Estratégia por página:
 * 1. Pega o texto da página N do arquivo pdftotext (separado por \x0C)
 * 2. Extrai a última frase não-vazia dessa página (âncora de busca)
 * 3. Procura essa frase no MD do capítulo
 * 4. Insere a(s) imagem(ns) logo após ela
 *
 * Para páginas sem texto (blank), usa o fim do texto da página anterior.
 */

const fs   = require('fs')
const path = require('path')

const ROOT         = path.join(__dirname, '..')
const RAW_TEXT     = path.join(ROOT, 'content', 'raw', 'curso_mergulho_autonomo_basico.utf8.layout.txt')
const CHAPTERS_DIR = path.join(ROOT, 'public', 'content', 'chapters')
const IMG_BASE     = '/assets/content/curso_mergulho_autonomo_basico/img'
const MAP_FILE     = path.join(__dirname, 'image-page-map.json')

// Ranges de página por capítulo (pdfjs 1-based, 112 páginas total)
// NOTA: fisiologia começa em pag 43 (não 44) — img-046.jpg está na pag 43
const CHAPTER_PAGES = {
  'cap-00-capa':              { start: 1,   end: 2   },
  'cap-01-historia-mergulho': { start: 3,   end: 8   },
  'cap-02-certificadoras':    { start: 9,   end: 9   },
  'cap-03-equipamentos':      { start: 10,  end: 24  },
  'cap-04-fisica-mergulho':   { start: 25,  end: 42  },
  'cap-05-fisiologia':        { start: 43,  end: 85  },
  'cap-06-tabelas-descomp':   { start: 86,  end: 100 },
  'cap-07-procedimentos':     { start: 71,  end: 104 },
  'cap-08-animais-marinhos':  { start: 105, end: 112 },
}

// ── Carregar dados ────────────────────────────────────────────────────────
const imagePageMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'))
const rawText      = fs.readFileSync(RAW_TEXT, 'utf8')
const rawPages     = rawText.split('\x0c')   // índice 0 = página 1

console.log('Mapa carregado:', Object.keys(imagePageMap).length, 'imagens')
console.log('Páginas de texto:', rawPages.length)

// ── Helper: extrair âncora de texto de uma página ─────────────────────────
// Usa o texto no MEIO da página (não o fim) para posicionar a imagem
// aproximadamente onde ela aparece visualmente no PDF.
function getPageAnchor(pageNum) {
  const idx  = pageNum - 1
  const page = (rawPages[idx] || '').replace(/\s+/g, ' ').trim()
  if (!page || page.length < 10) {
    return pageNum > 1 ? getPageAnchor(pageNum - 1) : null
  }

  // Linhas significativas (>= 12 chars, não é só número de página)
  const lines = page.split(/\n/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l.length >= 12 && !/^\d{1,3}$/.test(l))

  if (lines.length === 0) return pageNum > 1 ? getPageAnchor(pageNum - 1) : null

  // Usa a linha no ponto 55% do conteúdo da página
  // → imagem cai aproximadamente no meio/final da parte textual acima dela
  const midIdx   = Math.floor(lines.length * 0.55)
  const midLine  = lines[Math.min(midIdx, lines.length - 1)]
  const words    = midLine.split(/\s+/)
  return words.slice(-6).join(' ')
}

// ── Helper: normalizar texto para comparação ─────────────────────────────
function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Helper: encontrar posição da âncora no MD ─────────────────────────────
// Usa n-gramas SEM filtrar stopwords — mantém a sequência de palavras
function findAnchorLine(lines, anchor) {
  if (!anchor) return -1
  const normAnchor = normalize(anchor)
  const allWords   = normAnchor.split(' ').filter(w => w.length > 0)
  if (allWords.length === 0) return -1

  // Remove número de página solto no final (1-3 dígitos)
  const words = allWords[allWords.length - 1].match(/^\d{1,3}$/)
    ? allWords.slice(0, -1)
    : allWords

  if (words.length === 0) return -1

  // Busca progressiva: 5 → 4 → 3 → 2 palavras consecutivas
  for (let wCount = Math.min(words.length, 5); wCount >= 2; wCount--) {
    const phrase = words.slice(-wCount).join(' ')
    for (let i = lines.length - 1; i >= 0; i--) {
      if (normalize(lines[i]).includes(phrase)) {
        // Avança para o fim do parágrafo atual
        let insertAt = i + 1
        while (insertAt < lines.length && lines[insertAt].trim() !== '') {
          insertAt++
        }
        return insertAt
      }
    }
  }
  return -1
}

// ── Processar cada capítulo ────────────────────────────────────────────────
const files = fs.readdirSync(CHAPTERS_DIR)
  .filter(f => f.endsWith('.md'))
  .sort()

files.forEach(filename => {
  const slugBase = filename.replace(/\.md$/, '')
  const range    = CHAPTER_PAGES[slugBase]
  if (!range) { console.log('Sem range para ' + filename); return }

  const { start, end } = range

  // Imagens cujas páginas caem no range deste capítulo
  const chapImages = Object.entries(imagePageMap)
    .filter(([, pg]) => pg !== null && pg >= start && pg <= end)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))

  const mdPath     = path.join(CHAPTERS_DIR, filename)
  const raw        = fs.readFileSync(mdPath, 'utf8')

  // Separar frontmatter
  const fmMatch    = raw.match(/^---[\s\S]*?---\n/)
  const frontmatter = fmMatch ? fmMatch[0] : ''
  let body          = fmMatch ? raw.slice(frontmatter.length) : raw

  // Remover imagens antigas
  body = body
    .replace(/\n!\[.*?\]\(.*?\)\n?/g, '')
    .replace(/\n---\s*\n?$/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (chapImages.length === 0) {
    fs.writeFileSync(mdPath, frontmatter + body, 'utf8')
    console.log('  ' + filename + ': 0 imagens')
    return
  }

  // Trabalhar linha a linha para inserção precisa
  const lines = body.split('\n')

  // Agrupar imagens por página
  const byPage = {}
  chapImages.forEach(([img, pg]) => {
    if (!byPage[pg]) byPage[pg] = []
    byPage[pg].push(img)
  })

  // Inserir: processar páginas em ordem REVERSA para não deslocar índices
  const pages = Object.keys(byPage).map(Number).sort((a, b) => b - a)
  let inserted = 0
  let fallback = 0

  pages.forEach(pg => {
    const imgs   = byPage[pg]
    const anchor = getPageAnchor(pg)
    let insertAt = findAnchorLine(lines, anchor)

    if (insertAt === -1) {
      // Fallback: inserir no final do capítulo
      insertAt = lines.length
      fallback++
    }

    // Montar linhas de imagem
    const imgLines = []
    imgs.forEach(img => {
      imgLines.push('', '![](' + IMG_BASE + '/' + img + ')', '')
    })

    // Inserir no array de linhas
    lines.splice(insertAt, 0, ...imgLines)
    inserted += imgs.length
  })

  const newMd = frontmatter + lines.join('\n')
  fs.writeFileSync(mdPath, newMd, 'utf8')

  const msg = 'OK ' + filename + ': ' + inserted + ' imgs (págs ' + start + '-' + end + ')'
    + (fallback > 0 ? ' [' + fallback + ' págs sem âncora→final]' : '')
  console.log(msg)
})

console.log('\n✅ Injeção precisa por página concluída!')
