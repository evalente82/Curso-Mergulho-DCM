import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Minus, Plus,
  Maximize2, Minimize2, List, X, ChevronRight,
  LayoutDashboard,
} from 'lucide-react'
import { assetUrl } from '../../shared/basePath'
import type { Module, Chapter } from './ModuleDashboard'

// ── Utilitários ────────────────────────────────────────────────────────────
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-')
}

// ── Normaliza texto para comparação sem acento e sem maiúscula ────────────
// Mesma função usada em ContentSearch — garante que "pulmao" encontra "Pulmão"
function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
}

type TocEntry = { id: string; text: string; level: number }

// ── Pré-processa o markdown vindo dos capítulos ────────────────────────────
// 1. Remove linhas de marcador de imagem [nome.jpg] que não foram convertidas
// 2. Converte títulos de texto puro em headings markdown (#/##/###)
//    para que apareçam no TOC e recebam estilo de título
function preprocessMarkdown(raw: string): string {
  // Padrões de título reconhecidos no material:
  //   "5.1.a - APARELHO CIRCULATÓRIO"  → ### (subtítulo com letra)
  //   "4.2 - LEI DE BOYLE"             → ## (subtítulo numérico)
  //   "Fisiologia do mergulho  5"       → # (título do capítulo)
  //   "EQUIPAMENTO BÁSICO"             → ## (tudo maiúsculo curto)
  const SECTION_RE   = /^(\d+\.\d+[a-z]?\s*[-–]\s*.{3,60})\s*$/       // 5.1 - Titulo
  const SUBSECT_RE   = /^(\d+\.\d+\.[a-z]\s*[-–]\s*.{3,60})\s*$/      // 5.1.a - Titulo
  const ALLCAPS_RE   = /^([A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ\s\-\/()]{4,60})$/
  // Remove marcadores [nome.jpg] que vêm do raw — aceita letras maiúsculas, Unicode e acentos
  const MARKER_RE    = /^\s*\[[\w\u00C0-\u024F][\w\u00C0-\u024F\-]*\.(jpg|jpeg|png|gif|webp)\]\s*$/i

  return raw.split('\n').map(line => {
    // 1. Apaga marcadores órfãos de imagem
    if (MARKER_RE.test(line)) return ''

    // Já é um heading markdown → deixa como está
    if (line.startsWith('#')) return line

    const trimmed = line.trimEnd()

    // 2. Subtítulo com letra: "5.1.a - ..."
    if (SUBSECT_RE.test(trimmed)) return `### ${trimmed}`

    // 3. Seção numerada: "4.2 - ..."
    if (SECTION_RE.test(trimmed) && !SUBSECT_RE.test(trimmed)) return `## ${trimmed}`

    // 4. Tudo maiúsculo (ex: "APARELHO CIRCULATÓRIO", "EQUIPAMENTO BÁSICO")
    if (ALLCAPS_RE.test(trimmed) && trimmed === trimmed.toUpperCase()) return `## ${trimmed}`

    return line
  }).join('\n')
}

function extractToc(markdown: string): TocEntry[] {
  return markdown.split('\n')
    .flatMap(line => {
      const m = line.match(/^(#{1,4})\s+(.+)/)
      return m ? [{ id: slugify(m[2]), text: m[2].replace(/\*\*/g, ''), level: m[1].length }] : []
    })
}

// ── Componente principal ───────────────────────────────────────────────────
export default function ChapterReader() {
  const { moduleId = 'curso_mergulho_autonomo_basico', chapterId } = useParams<{
    moduleId: string
    chapterId: string
  }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [mod, setMod]           = useState<Module | null>(null)
  const [chapter, setChapter]   = useState<Chapter | null>(null)
  const [md, setMd]             = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(17)
  const [progress, setProgress] = useState(0)
  const [toc, setToc]           = useState<TocEntry[]>([])
  const [tocOpen, setTocOpen]   = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  const articleRef   = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Chave de persistência por capítulo ────────────────────────────────────
  const posKey = `rpos_${moduleId}_${chapterId}`

  // ── Carregar módulo ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(assetUrl('/content/index.json'))
      .then(r => r.json())
      .then((idx) => {
        const found = (idx.modules as Module[])?.find(m => m.id === moduleId)
        if (found) setMod(found)
      })
      .catch(console.error)
  }, [moduleId])

  // ── Capítulo atual ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mod || !chapterId) return
    const chap = mod.chapters.find(c => c.id === chapterId)
    if (chap) setChapter(chap)
  }, [mod, chapterId])

  // ── Carregar Markdown do capítulo ─────────────────────────────────────────
  useEffect(() => {
    if (!chapter) return
    setMd(null)
    setProgress(0)
    window.scrollTo(0, 0)

    fetch(assetUrl(`/content/chapters/${chapter.filename}`))
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(text => {
        const clean = preprocessMarkdown(text.replace(/^---[\s\S]*?---\n?/, ''))
        setMd(clean)
        setToc(extractToc(clean))
      })
      .catch(() => setMd('# Erro\nCapítulo não encontrado.'))
  }, [chapter])

  // ── Restaurar posição de leitura salva ────────────────────────────────────
  // Só restaura se NÃO houver parâmetro ?q= (busca tem prioridade)
  // Aguarda dois frames para garantir que o artigo foi pintado com altura real
  useEffect(() => {
    if (!md) return
    const q = searchParams.get('q')?.trim()
    if (q) return // busca tem prioridade — não restaura posição

    const saved = localStorage.getItem(posKey)
    if (!saved) return
    const pct = parseFloat(saved)
    if (!pct || pct < 1) return

    // Duplo rAF + pequeno delay: garante que o layout já tem altura real
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const article = articleRef.current
          if (!article) return
          const articleH = article.offsetHeight
          const viewH    = window.innerHeight || document.documentElement.clientHeight
          const total    = Math.max(1, articleH - viewH)
          const targetY  = Math.round((pct / 100) * total) + article.offsetTop
          window.scrollTo({ top: targetY, behavior: 'instant' })
        }, 150)
      })
    })
  }, [md]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Progresso de scroll ───────────────────────────────────────────────────
  // Usa getBoundingClientRect() no article — não depende de scrollTop/scrollY,
  // funciona independente de qual elemento CSS está scrollando (html/body/#root/etc.)
  // Salva a posição no localStorage com debounce de 800ms
  useEffect(() => {
    if (!md) return

    const calcProgress = () => {
      const article = articleRef.current
      if (!article) return

      const rect      = article.getBoundingClientRect()
      const articleH  = article.offsetHeight
      const viewH     = window.innerHeight || document.documentElement.clientHeight

      const scrolled = Math.max(0, -rect.top)
      const total    = Math.max(1, articleH - viewH)
      const pct      = Math.min(100, Math.round((scrolled / total) * 100))

      setProgress(pct)

      // Salva posição com debounce: evita escrever no localStorage a cada pixel
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        if (pct > 0) localStorage.setItem(posKey, String(pct))
      }, 800)
    }

    calcProgress()

    window.addEventListener('scroll', calcProgress, { passive: true })
    window.addEventListener('resize', calcProgress, { passive: true })
    document.addEventListener('scroll', calcProgress, { passive: true, capture: true })

    return () => {
      window.removeEventListener('scroll', calcProgress)
      window.removeEventListener('resize', calcProgress)
      document.removeEventListener('scroll', calcProgress, { capture: true } as any)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [md, posKey])

  // ── IntersectionObserver → TOC ativo ──────────────────────────────────────
  useEffect(() => {
    if (!md) return
    const headings = document.querySelectorAll('article h1,article h2,article h3,article h4')
    if (!headings.length) return
    const obs = new IntersectionObserver(
      entries => { const v = entries.find(e => e.isIntersecting); if (v) setActiveId(v.target.id) },
      { rootMargin: '-10% 0px -80% 0px' }
    )
    headings.forEach(h => obs.observe(h))
    return () => obs.disconnect()
  }, [md])

  const scrollToHeading = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTocOpen(false)
  }, [])

  // ── Scroll & highlight do termo de busca ──────────────────────────────────
  // Quando o usuário chega via busca (?q=palavra), localiza o primeiro elemento
  // do artigo que contém o termo e rola suavemente até ele, destacando-o.
  useEffect(() => {
    if (!md) return
    const q = searchParams.get('q')?.trim()
    if (!q) return

    // Aguarda o React terminar de renderizar o artigo no DOM
    const timer = setTimeout(() => {
      const article = articleRef.current
      if (!article) return

      const qNorm = normalizeSearch(q)

      // Percorre elementos de texto do artigo na ordem do DOM
      const candidates = article.querySelectorAll<HTMLElement>(
        'p, li, h1, h2, h3, h4, h5, h6, td, th'
      )

      let target: HTMLElement | null = null
      Array.from(candidates).some(el => {
        if (normalizeSearch(el.textContent ?? '').includes(qNorm)) {
          target = el as HTMLElement
          return true
        }
        return false
      })

      if (!target) return
      const hit = target as HTMLElement

      // Scroll até o elemento
      hit.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Highlight visual: adiciona classe temporária — 5 segundos
      hit.classList.add('search-hit')
      setTimeout(() => hit.classList.remove('search-hit'), 5000)
    }, 400) // 400ms → garante que o artigo já está pintado

    return () => clearTimeout(timer)
  }, [md, searchParams])

  // ── Navegação entre capítulos ─────────────────────────────────────────────
  const chapters = mod?.chapters ?? []
  const currentIdx = chapters.findIndex(c => c.id === chapterId)
  const prevChap = currentIdx > 0 ? chapters[currentIdx - 1] : null
  const nextChap = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null

  const goTo = (chap: Chapter, dir: 'left' | 'right') => {
    setDirection(dir)
    navigate(`/modulo/${moduleId}/${chap.id}`)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!md) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-ink-400">
        <div className="w-10 h-10 rounded-full border-4 border-ocean-300 border-t-ocean-600 animate-spin" />
        <span className="text-sm">Carregando capítulo…</span>
      </div>
    </div>
  )

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'relative'}>

      {/* ── Barra de progresso — topo da tela, z acima do navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-100 pointer-events-none">
        <motion.div
          className="h-full bg-ocean-500"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: .1 }}
        />
      </div>

      {/* ── Toolbar ── */}
      <div className={`sticky z-40 bg-white/90 backdrop-blur border-b border-ink-100 ${fullscreen ? 'top-0' : 'top-14'}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between h-12 px-4 gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <button
              onClick={() => navigate(`/modulo/${moduleId}`)}
              className="btn-ghost py-1.5 px-2 text-xs shrink-0"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Capítulos</span>
            </button>
            <button
              onClick={() => setTocOpen(o => !o)}
              className={`btn-ghost py-1.5 px-2 text-xs shrink-0 ${tocOpen ? 'bg-ocean-50 text-ocean-700' : ''}`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Índice</span>
            </button>
            {chapter && (
              <span className="text-xs text-ink-400 truncate hidden sm:block ml-1">
                {String(chapter.number).padStart(2,'0')}. {chapter.title}
              </span>
            )}
          </div>

          {/* Progresso com mini-barra — visível em TODAS as telas */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-ink-400 font-medium tabular-nums leading-none">
                {progress}% lido
              </span>
              <div className="w-20 h-1 rounded-full bg-ink-100 overflow-hidden">
                <motion.div
                  className="h-full bg-ocean-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: .1 }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setFontSize(s => Math.max(13, s - 1))} className="btn-ghost py-1.5 px-2" aria-label="Menor">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs text-ink-400 w-8 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(26, s + 1))} className="btn-ghost py-1.5 px-2" aria-label="Maior">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => setFullscreen(f => !f)} className="btn-ghost py-1.5 px-2 ml-1" aria-label="Tela cheia">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Layout: TOC lateral + Reader ── */}
      <div className="max-w-6xl mx-auto flex gap-6 px-4 py-8">

        {/* Sidebar TOC — desktop */}
        {toc.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-28">
              <TocPanel toc={toc} activeId={activeId} onSelect={scrollToHeading} />
            </div>
          </aside>
        )}

        {/* Reader */}
        <div className="flex-1 min-w-0 space-y-10">
          <AnimatePresence mode="wait">
            <motion.article
              key={chapter?.id}
              ref={articleRef}
              initial={{ opacity: 0, x: direction === 'right' ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 'right' ? -40 : 40 }}
              transition={{ duration: .35, ease: [.16,1,.3,1] }}
              className="prose prose-ocean max-w-none font-reading break-words overflow-hidden"
              style={{ fontSize, lineHeight: 1.85 }}
              onContextMenu={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
                  h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
                  h3: ({ children }) => <h3 id={slugify(String(children))}>{children}</h3>,
                  h4: ({ children }) => <h4 id={slugify(String(children))}>{children}</h4>,
                  // Evita <figure> dentro de <p> (HTML inválido → erro React)
                  // Se o parágrafo contém APENAS uma imagem, renderiza como div neutro
                  p: ({ node, children }) => {
                    const kids = node?.children ?? []
                    const isImgOnly =
                      kids.length === 1 &&
                      kids[0].type === 'element' &&
                      (kids[0] as { tagName?: string }).tagName === 'img'
                    if (isImgOnly) return <div className="my-0">{children}</div>
                    return <p>{children}</p>
                  },
                  img: ({ src, alt }) => {
                    // Garante que o caminho funciona tanto em dev (/) quanto em produção (/Curso-Mergulho-DCM/)
                    const imgSrc = src?.startsWith('http') ? src : assetUrl(src ?? '')

                    // Impede upscaling: quando a imagem natural é menor que o container,
                    // limita ao tamanho real (evita borrão por interpolação)
                    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
                      const img = e.currentTarget
                      const natural = img.naturalWidth
                      if (natural > 0 && natural < (img.parentElement?.clientWidth ?? 9999)) {
                        img.style.maxWidth = `${natural}px`
                      }
                    }

                    // Layout float-right: imagem à direita, texto flui à esquerda
                    if (alt === 'float-right') {
                      return (
                        <span
                          className="float-right clear-right ml-5 mb-4 block"
                          style={{ maxWidth: 'min(260px, 45%)' }}
                        >
                          <img
                            src={imgSrc} alt=""
                            className="rounded-xl w-full h-auto shadow-md"
                            loading="lazy"
                            decoding="async"
                            onLoad={handleLoad}
                          />
                        </span>
                      )
                    }
                    // Layout padrão: centralizado
                    return (
                      <figure className="my-6 flex flex-col items-center clear-both">
                        <img
                          src={imgSrc} alt={alt ?? ''}
                          className="rounded-xl max-w-full w-auto h-auto mx-auto shadow-md block"
                          loading="lazy"
                          decoding="async"
                          onLoad={handleLoad}
                          style={{ maxWidth: '100%' }}
                        />
                        {alt && alt.trim() !== '' && (
                          <figcaption className="text-center text-xs text-ink-400 mt-2 italic">{alt}</figcaption>
                        )}
                      </figure>
                    )
                  },
                  // Tabelas — scroll horizontal isolado no bloco, nunca na página
                  table: ({ children }) => (
                    <div className="overflow-x-auto w-full my-6 rounded-xl border border-ink-200">
                      <table className="min-w-full text-sm">{children}</table>
                    </div>
                  ),
                  // Bloco <pre> — se vier de indentação do MD (sem linguagem), renderiza como
                  // parágrafo simples itálico, igual ao PDF. Só usa estilo de código quando
                  // houver uma linguagem explícita (```js, ```bash etc.)
                  pre: ({ children }) => {
                    // Verifica se algum filho <code> tem classe de linguagem
                    const hasLang = Array.isArray(children)
                      ? children.some((c: any) => c?.props?.className?.includes('language-'))
                      : (children as any)?.props?.className?.includes('language-')
                    if (hasLang) {
                      return (
                        <pre className="overflow-x-auto max-w-full whitespace-pre-wrap break-words text-sm rounded-xl bg-ink-900 text-ink-100 p-4 my-4">
                          {children}
                        </pre>
                      )
                    }
                    // Texto simples com indentação → parágrafo itálico, sem borda/fundo
                    return (
                      <p className="my-3 italic text-ink-500 text-center text-sm">
                        {children}
                      </p>
                    )
                  },
                  code: ({ children, className }) => {
                    const isBlock = className?.includes('language-')
                    if (isBlock) return <code className={className}>{children}</code>
                    // inline code sem classe → texto simples, sem fundo colorido
                    return <span>{children}</span>
                  },
                  // Linha horizontal vira separador visual
                  hr: () => <div className="my-8 border-t-2 border-ocean-100" />,
                }}
              >
                {md}
              </ReactMarkdown>
            </motion.article>
          </AnimatePresence>

          {/* ── Navegação prev / next ── */}
          <nav className="flex items-stretch gap-3 pt-6 border-t border-ink-100">
            {prevChap ? (
              <button
                onClick={() => goTo(prevChap, 'left')}
                className="card flex-1 p-4 text-left flex items-center gap-3 group
                           hover:border-ocean-300 hover:bg-ocean-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-ink-300 group-hover:text-ocean-500 transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-ink-400 uppercase tracking-wide">Anterior</p>
                  <p className="text-sm font-semibold text-ink-800 line-clamp-1 group-hover:text-ocean-700 transition-colors">
                    {prevChap.icon} {prevChap.title}
                  </p>
                </div>
              </button>
            ) : <div className="flex-1" />}

            {nextChap ? (
              <button
                onClick={() => goTo(nextChap, 'right')}
                className="card flex-1 p-4 text-right flex items-center justify-end gap-3 group
                           hover:border-ocean-300 hover:bg-ocean-50 transition-all"
              >
                <div className="min-w-0">
                  <p className="text-[10px] text-ink-400 uppercase tracking-wide">Próximo</p>
                  <p className="text-sm font-semibold text-ink-800 line-clamp-1 group-hover:text-ocean-700 transition-colors">
                    {nextChap.icon} {nextChap.title}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink-300 group-hover:text-ocean-500 transition-colors shrink-0" />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/modulo/${moduleId}`)}
                className="card flex-1 p-4 text-right flex items-center justify-end gap-3 group
                           hover:border-ocean-300 hover:bg-ocean-50 transition-all"
              >
                <div>
                  <p className="text-[10px] text-ink-400 uppercase tracking-wide">Concluído</p>
                  <p className="text-sm font-semibold text-ocean-700">Voltar ao módulo</p>
                </div>
                <LayoutDashboard className="w-5 h-5 text-ocean-400 shrink-0" />
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* ── TOC Mobile drawer ── */}
      <AnimatePresence>
        {tocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setTocOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-bold text-sm text-ink-800">Índice</span>
                <button onClick={() => setTocOpen(false)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3">
                <TocPanel toc={toc} activeId={activeId} onSelect={scrollToHeading} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── TOC Panel ──────────────────────────────────────────────────────────────
function TocPanel({
  toc, activeId, onSelect
}: { toc: TocEntry[]; activeId: string; onSelect: (id: string) => void }) {
  if (toc.length === 0) return (
    <nav aria-label="Índice">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2 px-1">Neste capítulo</p>
      <p className="text-xs text-ink-400 px-2">Nenhuma seção encontrada.</p>
    </nav>
  )

  // Aviso quando há poucas entradas (possivelmente falta de headings no MD)
  const fewEntries = toc.length === 1

  return (
    <nav aria-label="Índice">
      {/* Cabeçalho com contador */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
          Neste capítulo
        </p>
        <span className="text-[10px] font-semibold text-ink-300 bg-ink-100 rounded-full px-1.5 py-0.5">
          {toc.length}
        </span>
      </div>

      {/* Banner de aviso quando só tem 1 item */}
      {fewEntries && (
        <div className="mb-3 px-2 py-2 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-[10px] text-amber-700 leading-tight">
            💡 Adicione títulos <code className="font-mono">##</code> e <code className="font-mono">###</code> no editor para criar mais seções no índice.
          </p>
        </div>
      )}

      <ul className="space-y-0.5">
        {toc.map((entry, i) => {
          const isActive = activeId === entry.id

          // Cores e estilos por nível
          const levelConfig = {
            1: {
              indent: '',
              weight: 'font-bold text-[11px]',
              marker: <span className="shrink-0 w-2 h-2 rounded-sm bg-ocean-400 opacity-80" />,
              label: null,
            },
            2: {
              indent: 'pl-3',
              weight: 'font-semibold text-[11px]',
              marker: <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-50 mt-px" />,
              label: <span className="text-[9px] uppercase tracking-wide text-ink-300 font-medium shrink-0">Seção</span>,
            },
            3: {
              indent: 'pl-6',
              weight: 'font-normal text-[10.5px]',
              marker: <ChevronRight className="w-3 h-3 shrink-0 text-ink-300" />,
              label: <span className="text-[9px] uppercase tracking-wide text-ink-300 font-medium shrink-0">Sub</span>,
            },
            4: {
              indent: 'pl-9',
              weight: 'font-normal text-[10px] italic',
              marker: <span className="shrink-0 w-0.5 h-3 rounded bg-ink-200" />,
              label: null,
            },
          }[Math.min(entry.level, 4) as 1|2|3|4] ?? {
            indent: 'pl-9', weight: 'font-normal text-[10px]', marker: null, label: null
          }

          const color = isActive
            ? 'text-ocean-600 bg-ocean-50 ring-1 ring-ocean-200'
            : 'text-ink-600 hover:text-ocean-600 hover:bg-ink-50'

          return (
            <li key={`${entry.id}-${i}`} className="relative">
              {/* Linha vertical da árvore para sub-itens */}
              {entry.level > 1 && (
                <span
                  className="absolute left-[10px] top-0 bottom-0 w-px bg-ink-100"
                  aria-hidden
                />
              )}
              <button
                onClick={() => onSelect(entry.id)}
                title={entry.text}
                className={`w-full text-left flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors
                  ${levelConfig.indent} ${levelConfig.weight} ${color}`}
              >
                {levelConfig.marker}
                <span className="truncate leading-tight flex-1">{entry.text}</span>
                {levelConfig.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
