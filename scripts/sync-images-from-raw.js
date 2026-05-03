/**
 * sync-images-from-raw.js
 * ─────────────────────────────────────────────────────────────────────────
 * FLUXO:
 *   1. Você edita content/raw/curso_mergulho_autonomo_basico.md
 *      e coloca marcadores  [nome_imagem.jpg]  ou  [float-right:nome.jpg]
 *      no ponto exato do texto onde a imagem deve aparecer.
 *
 *   2. Você roda:  node scripts/sync-images-from-raw.js
 *
 *   3. O script:
 *      - Detecta cada marcador e o texto âncora (linha anterior não vazia)
 *      - Identifica em qual capítulo aquele trecho de texto está
 *      - Injeta o ![...](caminho) no lugar certo do capítulo MD
 *      - Faz commit automático se --commit for passado
 *
 * MARCADORES SUPORTADOS:
 *   [nome_imagem.jpg]               → imagem centralizada
 *   [float-right:nome_imagem.jpg]   → imagem à direita com texto à esquerda
 * ─────────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs')
const path = require('path')

// ── Configuração ──────────────────────────────────────────────────────────
const ROOT         = path.join(__dirname, '..')
const MAIN_MD      = path.join(ROOT, 'content', 'raw', 'curso_mergulho_autonomo_basico.md')
const CHAPTERS_DIR = path.join(ROOT, 'public', 'content', 'chapters')
const IMG_BASE     = '/assets/content/curso_mergulho_autonomo_basico/img'

// Mapa: slug do capítulo → intervalos de linha no arquivo raw (0-based)
// Deve bater com o split-chapters.js
const CHAPTER_RANGES = [
  { slug: 'capa',              start: 0,    end: 20   },
  { slug: 'historia-mergulho', start: 20,   end: 220  },
  { slug: 'certificadoras',    start: 220,  end: 266  },
  { slug: 'equipamentos',      start: 266,  end: 784  },
  { slug: 'fisica-mergulho',   start: 784,  end: 1288 },
  { slug: 'fisiologia',        start: 1288, end: 2839 },
  { slug: 'tabelas-descomp',   start: 2839, end: 3141 },
  { slug: 'procedimentos',     start: 3141, end: 3437 },
  { slug: 'animais-marinhos',  start: 3437, end: 99999},
]

// ── Ler raw ───────────────────────────────────────────────────────────────
const rawContent  = fs.readFileSync(MAIN_MD, 'utf8')
const rawLines    = rawContent.split('\n')

// ── Detectar todos os marcadores ──────────────────────────────────────────
// Padrão: linha contendo APENAS [nome.jpg] ou [float-right:nome.jpg]
const MARKER_RE = /^\s*\[(float-right:)?([a-zA-Z0-9_\-]+\.(jpg|jpeg|png|gif|webp))\]\s*$/i

const markers = []
rawLines.forEach((line, lineIdx) => {
  const m = line.match(MARKER_RE)
  if (!m) return

  const floatRight = Boolean(m[1])
  const imgName    = m[2]

  // Âncora: última linha não vazia ANTES do marcador
  let anchorLine = ''
  for (let i = lineIdx - 1; i >= 0; i--) {
    const candidate = rawLines[i].trim()
    // Ignora números de página e linhas só com espaços
    if (candidate && !/^\d+$/.test(candidate) && !candidate.match(/^\[/)) {
      anchorLine = candidate
      break
    }
  }

  // Linha de texto logo APÓS o marcador (para âncora de fallback)
  let afterLine = ''
  for (let i = lineIdx + 1; i < rawLines.length; i++) {
    const candidate = rawLines[i].trim()
    if (candidate && !/^\d+$/.test(candidate) && !candidate.match(/^\[/)) {
      afterLine = candidate
      break
    }
  }

  // Identificar capítulo pela linha do raw
  const chap = CHAPTER_RANGES.find(c => lineIdx >= c.start && lineIdx < c.end)
  const chapSlug = chap?.slug ?? null

  markers.push({ lineIdx, imgName, floatRight, anchorLine, afterLine, chapSlug })
})

if (markers.length === 0) {
  console.log('ℹ️  Nenhum marcador [imagem.ext] encontrado no arquivo raw.')
  console.log('   Adicione marcadores e rode novamente.')
  process.exit(0)
}

console.log(`\n🔍 Encontrados ${markers.length} marcadores:\n`)
markers.forEach(mk => {
  console.log(`  [${mk.floatRight ? 'float-right' : 'center'}] ${mk.imgName}`)
  console.log(`    capítulo : ${mk.chapSlug ?? '⚠️  não identificado'}`)
  console.log(`    âncora   : "${mk.anchorLine.slice(0, 80)}"`)
  console.log()
})

// ── Agrupar por capítulo ──────────────────────────────────────────────────
const byChapter = {}
markers.forEach(mk => {
  if (!mk.chapSlug) {
    console.warn(`⚠️  Marcador ${mk.imgName} não associado a nenhum capítulo — pulando`)
    return
  }
  if (!byChapter[mk.chapSlug]) byChapter[mk.chapSlug] = []
  byChapter[mk.chapSlug].push(mk)
})

// ── Processar cada capítulo ────────────────────────────────────────────────
let totalInjected = 0
let totalFallback = 0

Object.entries(byChapter).forEach(([slug, mkList]) => {
  // Encontrar arquivo do capítulo
  const files = fs.readdirSync(CHAPTERS_DIR).filter(f => f.includes(`-${slug}.md`))
  if (files.length === 0) {
    console.warn(`⚠️  Arquivo do capítulo "${slug}" não encontrado em ${CHAPTERS_DIR}`)
    return
  }
  const chapFile = path.join(CHAPTERS_DIR, files[0])
  let chapContent = fs.readFileSync(chapFile, 'utf8')
  let chapLines   = chapContent.split('\n')

  console.log(`\n📄 ${files[0]}  (${mkList.length} imagem(ns) a injetar)`)

  mkList.forEach(mk => {
    // Construir tag markdown
    const imgTag = mk.floatRight
      ? `\n![float-right](${IMG_BASE}/${mk.imgName})\n`
      : `\n![](${IMG_BASE}/${mk.imgName})\n`

    // Normalizar âncora para busca (remove espaços múltiplos, letras maiúsculas)
    const normalize = (s) => s.replace(/\s+/g, ' ').trim()

    // Estratégia 1: buscar a linha âncora exata
    let insertIdx = -1
    const anchorNorm = normalize(mk.anchorLine)

    for (let i = 0; i < chapLines.length; i++) {
      if (normalize(chapLines[i]).includes(anchorNorm.slice(0, 60))) {
        insertIdx = i + 1   // inserir APÓS a linha âncora
        break
      }
    }

    // Estratégia 2: buscar primeiras palavras da âncora (palavras únicas)
    if (insertIdx === -1) {
      const words = anchorNorm.split(' ').filter(w => w.length > 5).slice(0, 4).join(' ')
      if (words) {
        for (let i = 0; i < chapLines.length; i++) {
          if (normalize(chapLines[i]).includes(words)) {
            insertIdx = i + 1
            break
          }
        }
      }
    }

    // Estratégia 3: buscar linha APÓS o marcador (afterLine)
    if (insertIdx === -1 && mk.afterLine) {
      const afterNorm = normalize(mk.afterLine)
      const words = afterNorm.split(' ').filter(w => w.length > 5).slice(0, 4).join(' ')
      if (words) {
        for (let i = 0; i < chapLines.length; i++) {
          if (normalize(chapLines[i]).includes(words)) {
            insertIdx = i   // inserir ANTES dessa linha
            break
          }
        }
      }
    }

    if (insertIdx !== -1) {
      chapLines.splice(insertIdx, 0, imgTag)
      totalInjected++
      console.log(`  ✅ ${mk.imgName} → inserido após linha ${insertIdx}`)
    } else {
      // Fallback: adiciona no final
      chapLines.push(imgTag)
      totalFallback++
      console.log(`  ⚠️  ${mk.imgName} → âncora não encontrada, adicionado ao final`)
      console.log(`       âncora buscada: "${mk.anchorLine.slice(0, 60)}"`)
    }
  })

  fs.writeFileSync(chapFile, chapLines.join('\n'), 'utf8')
  console.log(`  💾 Salvo: ${files[0]}`)
})

console.log(`\n✅ Concluído — ${totalInjected} injetadas, ${totalFallback} fallbacks`)
console.log('\nPróximo passo:')
console.log('  git add public/content/chapters/')
console.log('  git commit -m "feat(content): imagens sincronizadas do raw"')
console.log('  git push origin main')
