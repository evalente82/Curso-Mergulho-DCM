/**
 * extract-by-position.mjs  v2
 *
 * Estratégia híbrida (a mais confiável possível sem pdfimages -list):
 *
 * - pdfjs  → por página: quantas imagens há e qual a fração Y de cada uma
 *            (posição relativa 0.0 = topo, 1.0 = base da página)
 * - pdftotext → texto de cada página em ordem de leitura (confiável)
 *
 * Para cada página com N imagens:
 *   1. Pega o texto da página (pdftotext)
 *   2. Divide esse texto em N+1 blocos pela fração Y de cada imagem
 *      (bloco[0] = texto antes da 1ª imagem, bloco[1] = entre 1ª e 2ª, ...)
 *   3. Usa as últimas palavras do bloco anterior como âncora no MD
 *   4. Insere a imagem logo após essa âncora
 *
 * Renomeia as imagens: capitulo_palavrasAntes_palavrasDepois
 * Gera images-manifest.json para ajuste manual opcional.
 */

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const PDF_PATH     = path.join(ROOT, 'content', 'raw_pdfs', 'curso_mergulho_autonomo_basico.pdf')
const RAW_TEXT     = path.join(ROOT, 'content', 'raw', 'curso_mergulho_autonomo_basico.utf8.layout.txt')
const IMG_DIR      = path.join(ROOT, 'public', 'assets', 'content', 'curso_mergulho_autonomo_basico', 'img')
const CHAPTERS_DIR = path.join(ROOT, 'public', 'content', 'chapters')
const MANIFEST_FILE = path.join(__dirname, 'images-manifest.json')
const IMG_BASE     = '/assets/content/curso_mergulho_autonomo_basico/img'

const CHAPTER_RANGES = [
  { slug: 'cap-00-capa',              start: 1,   end: 2   },
  { slug: 'cap-01-historia-mergulho', start: 3,   end: 8   },
  { slug: 'cap-02-certificadoras',    start: 9,   end: 9   },
  { slug: 'cap-03-equipamentos',      start: 10,  end: 24  },
  { slug: 'cap-04-fisica-mergulho',   start: 25,  end: 42  },
  { slug: 'cap-05-fisiologia',        start: 43,  end: 85  },
  { slug: 'cap-06-tabelas-descomp',   start: 86,  end: 100 },
  { slug: 'cap-07-procedimentos',     start: 71,  end: 104 },
  { slug: 'cap-08-animais-marinhos',  start: 105, end: 112 },
]

// Imagens em ordem de extração do PDF
const existingImages = fs.readdirSync(IMG_DIR)
  .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
  .sort()

// pdftotext pages (0-indexed = pág 1)
const rawPages = fs.readFileSync(RAW_TEXT, 'utf8').split('\x0c')

// ── Helpers ───────────────────────────────────────────────────────────────
function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}
function slugify(s) {
  return normalize(s).replace(/\s+/g, '_').replace(/_+/g, '_')
    .replace(/^_|_$/g, '').substring(0, 28)
}
function keywords(text, n = 2) {
  return (text || '').split(/\s+/)
    .filter(w => w.replace(/[^a-zA-Z]/g,'').length > 3).slice(-n).join('_') || 'x'
}

// ── Extrair imagens por página com fração Y (0=topo, 1=base) ─────────────
async function getPageImageFractions(page) {
  const viewport = page.getViewport({ scale: 1.0 })
  const height   = viewport.height
  const opList   = await page.getOperatorList()

  const IMAGE_OPS = new Set([
    pdfjs.OPS.paintImageXObject,
    pdfjs.OPS.paintInlineImageXObject,
    pdfjs.OPS.paintImageMaskXObject,
  ])

  const ctmStack = [[1,0,0,1,0,0]]
  const fractions = []

  for (let i = 0; i < opList.fnArray.length; i++) {
    const op   = opList.fnArray[i]
    const args = opList.argsArray[i]

    if (op === pdfjs.OPS.save) {
      ctmStack.push([...ctmStack.at(-1)])
    } else if (op === pdfjs.OPS.restore) {
      if (ctmStack.length > 1) ctmStack.pop()
    } else if (op === pdfjs.OPS.transform) {
      const [a,b,c,d,e,f] = args
      const cur = ctmStack.at(-1)
      ctmStack[ctmStack.length-1] = [
        cur[0]*a+cur[2]*b, cur[1]*a+cur[3]*b,
        cur[0]*c+cur[2]*d, cur[1]*c+cur[3]*d,
        cur[0]*e+cur[2]*f+cur[4], cur[1]*e+cur[3]*f+cur[5],
      ]
    } else if (IMAGE_OPS.has(op)) {
      const ctm = ctmStack.at(-1)
      const rawY = ctm[5]
      const imgH = Math.abs(ctm[3] || 1)
      // Centro da imagem no espaço PDF (Y invertido)
      const centerY = rawY + imgH / 2
      const frac    = Math.max(0, Math.min(1, 1 - centerY / height))
      fractions.push(parseFloat(frac.toFixed(3)))
    }
  }
  return fractions  // array de frações, uma por imagem, em ordem de renderização
}

// ── Obter texto útil de uma página (pdftotext, sem número de página) ──────
function getPageText(pageNum) {
  const idx  = pageNum - 1
  const raw  = (rawPages[idx] || '').trim()
  // Remover número de página isolado no fim
  return raw.replace(/\n\s*\d{1,3}\s*$/, '').trim()
}

// ── Dividir texto de uma página em N+1 segmentos por frações Y ────────────
function splitTextByFractions(pageText, fractions) {
  if (fractions.length === 0) return [pageText]
  const lines = pageText.split('\n')
  const total = lines.length
  if (total === 0) return Array(fractions.length + 1).fill('')

  const segments = []
  let prevLine = 0

  const sorted = [...fractions].sort((a,b) => a-b)

  for (const frac of sorted) {
    const cutLine = Math.round(frac * total)
    segments.push(lines.slice(prevLine, cutLine).join('\n').trim())
    prevLine = cutLine
  }
  segments.push(lines.slice(prevLine).join('\n').trim())
  return segments
}

// ── Encontrar linha de inserção no MD pela âncora ─────────────────────────
function findInsertLine(mdLines, anchorText) {
  if (!anchorText || anchorText.length < 6) return -1
  const normA = normalize(anchorText)
  const words = normA.split(' ').filter(w => w.length > 0)
  // Remove número de página no final
  const clean = words.at(-1)?.match(/^\d{1,3}$/) ? words.slice(0,-1) : words

  for (let wc = Math.min(clean.length, 5); wc >= 2; wc--) {
    const phrase = clean.slice(-wc).join(' ')
    for (let i = mdLines.length - 1; i >= 0; i--) {
      if (normalize(mdLines[i]).includes(phrase)) {
        let ins = i + 1
        while (ins < mdLines.length && mdLines[ins].trim() !== '') ins++
        return ins
      }
    }
  }
  return -1
}

// ── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
  const data   = new Uint8Array(fs.readFileSync(PDF_PATH))
  const pdfDoc = await pdfjs.getDocument({ data, verbosity: 0 }).promise
  console.log(`PDF: ${pdfDoc.numPages} páginas | Imagens extraídas: ${existingImages.length}`)

  // Passo 1: mapear globalImgIdx → { page, fracY }
  const imagePositions = []  // [{ globalIdx, page, fracY }]
  let globalIdx = 0

  process.stdout.write('Lendo posições de imagens: ')
  for (let pn = 1; pn <= pdfDoc.numPages; pn++) {
    const page = await pdfDoc.getPage(pn)
    const fracs = await getPageImageFractions(page)
    for (const frac of fracs) {
      imagePositions.push({ globalIdx, page: pn, fracY: frac })
      globalIdx++
    }
    if (pn % 20 === 0) process.stdout.write(`${pn}..`)
  }
  console.log(' OK')
  console.log(`Total imagens detectadas pelo pdfjs: ${imagePositions.length}`)

  // Passo 2: para cada imagem, extrair textBefore/textAfter usando pdftotext
  const manifest = {}
  const chapterOf = (pn) => CHAPTER_RANGES.find(r => pn >= r.start && pn <= r.end)

  imagePositions.forEach((pos, i) => {
    const origName = existingImages[pos.globalIdx] || `img-${String(pos.globalIdx).padStart(3,'0')}.jpg`
    const pageText = getPageText(pos.page)
    const pageLines = pageText.split('\n')
    const total = pageLines.length || 1
    const cutLine = Math.round(pos.fracY * total)

    const textBefore = pageLines.slice(Math.max(0, cutLine - 4), cutLine).join(' ').trim()
    const textAfter  = pageLines.slice(cutLine, Math.min(total, cutLine + 4)).join(' ').trim()

    const chap = chapterOf(pos.page)
    const chapShort = chap ? chap.slug.replace(/^cap-\d+-/, '') : 'misc'
    const ext = path.extname(origName)
    const newName = `${chapShort}_${slugify(keywords(textBefore,2))}_${slugify(keywords(textAfter,2))}${ext}`
      .replace(/__+/g,'_').replace(/^_|_$/g,'')

    manifest[origName] = {
      newName,
      page       : pos.page,
      fracY      : pos.fracY,
      textBefore : textBefore.substring(0, 100),
      textAfter  : textAfter.substring(0, 100),
    }
  })

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8')
  console.log(`\nManifesto salvo → scripts/images-manifest.json`)
  console.log('Você pode editar "newName" no manifesto antes de rodar apply-manifest.mjs\n')

  // Passo 3: inserir imagens nos MDs
  for (const chap of CHAPTER_RANGES) {
    const mdPath = path.join(CHAPTERS_DIR, `${chap.slug}.md`)
    if (!fs.existsSync(mdPath)) continue

    // Ler e limpar MD
    const raw = fs.readFileSync(mdPath, 'utf8')
    const fmMatch = raw.match(/^---[\s\S]*?---\n/)
    const frontmatter = fmMatch ? fmMatch[0] : ''
    let body = fmMatch ? raw.slice(frontmatter.length) : raw
    body = body.replace(/\n!\[.*?\]\(.*?\)\n?/g, '').replace(/\n{3,}/g,'\n\n').trim()
    const mdLines = body.split('\n')

    // Imagens deste capítulo ordenadas por página + fracY
    const chapImgs = Object.entries(manifest)
      .filter(([, v]) => v.page >= chap.start && v.page <= chap.end)
      .sort((a,b) => a[1].page - b[1].page || a[1].fracY - b[1].fracY)

    if (chapImgs.length === 0) {
      fs.writeFileSync(mdPath, frontmatter + body, 'utf8')
      console.log(`  ${chap.slug}: sem imagens`)
      continue
    }

    // Calcular posição de inserção para cada imagem
    let fallbacks = 0
    const insertions = chapImgs.map(([orig, info]) => {
      const line = findInsertLine(mdLines, info.textBefore)
      if (line === -1) fallbacks++
      return { line: line === -1 ? mdLines.length : line, imgName: info.newName }
    }).sort((a,b) => b.line - a.line)  // de trás para frente

    insertions.forEach(({ line, imgName }) => {
      mdLines.splice(line, 0, '', `![](${IMG_BASE}/${imgName})`, '')
    })

    const newMd = frontmatter + '\n' + mdLines.join('\n').replace(/\n{4,}/g,'\n\n')
    fs.writeFileSync(mdPath, newMd, 'utf8')

    const fb = fallbacks > 0 ? ` [${fallbacks} fallback→final]` : ''
    console.log(`✓ ${chap.slug}: ${chapImgs.length} imgs${fb}`)
  }

  console.log('\n✅ Concluído! Execute agora:')
  console.log('   node scripts/apply-manifest.mjs   ← renomeia os arquivos de imagem')
}

main().catch(e => { console.error(e); process.exit(1) })
