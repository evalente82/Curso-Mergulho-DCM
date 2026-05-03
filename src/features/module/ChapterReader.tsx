import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

type TocEntry = { id: string; text: string; level: number }

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

  const articleRef = useRef<HTMLDivElement>(null)

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
        const clean = text.replace(/^---[\s\S]*?---\n?/, '')
        setMd(clean)
        setToc(extractToc(clean))
      })
      .catch(() => setMd('# Erro\nCapítulo não encontrado.'))
  }, [chapter])

  // ── Progresso de scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const calcProgress = () => {
      // Suporte cross-browser: some mobile browsers usam body.scrollTop
      const scrollY = window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop ?? 0
      const total   = (document.documentElement.scrollHeight - document.documentElement.clientHeight)
      setProgress(total > 0 ? Math.min(100, Math.round((scrollY / total) * 100)) : 0)
    }
    // Dispara imediatamente ao montar (garante 0% correto)
    calcProgress()
    window.addEventListener('scroll', calcProgress, { passive: true })
    window.addEventListener('resize', calcProgress, { passive: true })
    return () => {
      window.removeEventListener('scroll', calcProgress)
      window.removeEventListener('resize', calcProgress)
    }
  }, [md])

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
                          />
                        </span>
                      )
                    }
                    // Layout padrão: centralizado
                    return (
                      <figure className="my-6 flex flex-col items-center clear-both">
                        <img
                          src={imgSrc} alt={alt ?? ''}
                          className="rounded-xl max-w-full w-auto h-auto mx-auto shadow-md"
                          loading="lazy"
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
  return (
    <nav aria-label="Índice">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2 px-1">Neste capítulo</p>
      <ul className="space-y-0.5">
        {toc.map(entry => (
          <li key={entry.id}>
            <button
              onClick={() => onSelect(entry.id)}
              className={`
                w-full text-left flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors
                ${entry.level === 1 ? 'font-bold' : entry.level === 2 ? 'font-semibold pl-4' : 'pl-6 text-ink-500'}
                ${activeId === entry.id ? 'bg-ocean-50 text-ocean-700' : 'text-ink-600 hover:bg-ink-100'}
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
