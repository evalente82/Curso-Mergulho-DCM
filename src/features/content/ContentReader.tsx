import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Minus, Plus, Maximize2, Minimize2,
  List, X, ChevronRight,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type TocEntry = { id: string; text: string; level: number }

// ─── Utilitários ──────────────────────────────────────────────────────────────
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractToc(markdown: string): TocEntry[] {
  const lines = markdown.split('\n')
  const toc: TocEntry[] = []
  for (const line of lines) {
    const m = line.match(/^(#{1,4})\s+(.+)/)
    if (m) toc.push({ id: slugify(m[2]), text: m[2].replace(/\*\*/g, ''), level: m[1].length })
  }
  return toc
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ContentReader() {
  const { id = 'curso_mergulho_autonomo_basico' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [md, setMd]             = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(17)
  const [progress, setProgress] = useState(0)
  const [toc, setToc]           = useState<TocEntry[]>([])
  const [tocOpen, setTocOpen]   = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [activeId, setActiveId] = useState('')

  const articleRef = useRef<HTMLDivElement>(null)

  // ── Carregar Markdown ──
  useEffect(() => {
    setMd(null)
    fetch(`/content/raw/${id}.md`)
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(text => {
        // Remove o bloco de frontmatter YAML (--- ... ---) se presente
        const clean = text.replace(/^---[\s\S]*?---\n?/, '')
        setMd(clean)
        setToc(extractToc(clean))
      })
      .catch(() => setMd('# Erro\nConteúdo não encontrado.'))
  }, [id])

  // ── Barra de progresso de scroll ──
  useEffect(() => {
    const el = articleRef.current
    if (!el) return
    const onScroll = () => {
      const scrolled = window.scrollY
      const total    = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [md])

  // ── IntersectionObserver para TOC ativo ──
  useEffect(() => {
    if (!md) return
    const headings = document.querySelectorAll('article h1,article h2,article h3,article h4')
    if (!headings.length) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.find(e => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-10% 0px -80% 0px' }
    )
    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [md])

  // ── Scroll para heading ao clicar no TOC ──
  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTocOpen(false)
    }
  }, [])

  if (!md) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-ink-400">
        <div className="w-10 h-10 rounded-full border-4 border-ocean-300 border-t-ocean-600 animate-spin" />
        <span className="text-sm">Carregando apostila…</span>
      </div>
    </div>
  )

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'relative'}>
      {/* ── Barra de progresso ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-100 pointer-events-none">
        <motion.div
          className="h-full bg-ocean-500"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: .1 }}
        />
      </div>

      {/* ── Toolbar ── */}
      <div className={`sticky z-40 bg-white/90 backdrop-blur border-b border-ink-100 ${fullscreen ? 'top-0' : 'top-14'}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between h-12 px-4 gap-2">
          {/* Esquerda */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="btn-ghost py-1.5 px-2 text-xs">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={() => setTocOpen(o => !o)}
              className={`btn-ghost py-1.5 px-2 text-xs ${tocOpen ? 'bg-ocean-50 text-ocean-700' : ''}`}
              aria-label="Índice"
            >
              <List className="w-4 h-4" /> Índice
            </button>
          </div>

          {/* Centro: progresso */}
          <span className="text-xs text-ink-400 font-medium tabular-nums hidden sm:block">
            {progress}% lido
          </span>

          {/* Direita: fonte + fullscreen */}
          <div className="flex items-center gap-1">
            <button onClick={() => setFontSize(s => Math.max(13, s - 1))} className="btn-ghost py-1.5 px-2" aria-label="Diminuir fonte">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs text-ink-400 w-8 text-center">{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(26, s + 1))} className="btn-ghost py-1.5 px-2" aria-label="Aumentar fonte">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => setFullscreen(f => !f)} className="btn-ghost py-1.5 px-2 ml-1" aria-label="Tela cheia">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Layout: TOC lateral + Reader ── */}
      <div className="max-w-6xl mx-auto flex gap-6 px-4 py-8 relative">

        {/* Sidebar TOC — desktop */}
        {toc.length > 0 && (
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-28">
              <TocPanel toc={toc} activeId={activeId} onSelect={scrollToHeading} />
            </div>
          </aside>
        )}

        {/* Reader principal */}
        <div className="flex-1 min-w-0">
          <motion.article
            ref={articleRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4 }}
            className="prose prose-ocean max-w-none font-reading"
            style={{ fontSize, lineHeight: 1.85 }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Injeta id nas headings para scroll/TOC
                h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
                h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
                h3: ({ children }) => <h3 id={slugify(String(children))}>{children}</h3>,
                h4: ({ children }) => <h4 id={slugify(String(children))}>{children}</h4>,
                // Imagens responsivas
                img: ({ src, alt }) => (
                  <figure className="my-6">
                    <img src={src} alt={alt ?? ''} className="rounded-xl max-w-full mx-auto shadow" loading="lazy" />
                    {alt && <figcaption className="text-center text-xs text-ink-400 mt-2">{alt}</figcaption>}
                  </figure>
                ),
              }}
            >
              {md}
            </ReactMarkdown>
          </motion.article>
        </div>
      </div>

      {/* ── TOC Mobile: drawer ── */}
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
                <button onClick={() => setTocOpen(false)} className="btn-ghost p-1">
                  <X className="w-4 h-4" />
                </button>
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

// ─── TOC Panel ────────────────────────────────────────────────────────────────
function TocPanel({
  toc, activeId, onSelect
}: { toc: TocEntry[]; activeId: string; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="Índice do documento">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-3 px-1">Índice</p>
      <ul className="space-y-0.5">
        {toc.map(entry => (
          <li key={entry.id}>
            <button
              onClick={() => onSelect(entry.id)}
              className={`
                w-full text-left flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors
                ${entry.level === 1 ? 'font-bold' : entry.level === 2 ? 'font-semibold pl-4' : 'pl-6 text-ink-500'}
                ${activeId === entry.id
                  ? 'bg-ocean-50 text-ocean-700'
                  : 'text-ink-600 hover:bg-ink-100'}
              `}
            >
              {entry.level >= 3 && <ChevronRight className="w-3 h-3 shrink-0 text-ink-300" />}
              <span className="line-clamp-2">{entry.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

