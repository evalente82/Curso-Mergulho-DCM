import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Image, ChevronRight, Waves } from 'lucide-react'

// ── Tipos ──────────────────────────────────────────────────────────────────
export type Chapter = {
  id: string
  moduleId: string
  number: number
  title: string
  description: string
  icon: string
  excerpt?: string
  imageCount?: number
  filename?: string
}

export type Module = {
  id: string
  title: string
  subtitle?: string
  tags?: string[]
  chapters: Chapter[]
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function ModuleDashboard({ module: mod }: { module: Module }) {
  const navigate = useNavigate()

  const goToChapter = (chap: Chapter) =>
    navigate(`/modulo/${mod.id}/${chap.id}`)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* ── Hero do módulo ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-800 via-ocean-900 to-ocean-950 text-white p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
                        from-ocean-600/20 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-ocean-300 mb-3">
            <Waves className="w-4 h-4" /> Defesa Civil Maricá
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{mod.title}</h1>
          {mod.subtitle && (
            <p className="text-ocean-300 text-sm mt-1">{mod.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {mod.tags?.map(t => (
              <span key={t} className="text-xs bg-ocean-700/60 text-ocean-200 px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
          {/* Progresso geral */}
          <div className="mt-6 flex items-center gap-3 text-sm">
            <BookOpen className="w-4 h-4 text-ocean-300" />
            <span className="text-ocean-200">{mod.chapters.length} capítulos</span>
            <span className="text-ocean-500">·</span>
            <Image className="w-4 h-4 text-ocean-300" />
            <span className="text-ocean-200">
              {mod.chapters.reduce((s, c) => s + (c.imageCount ?? 0), 0)} imagens
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Grade de capítulos ── */}
      <div>
        <h2 className="text-base font-bold text-ink-500 uppercase tracking-widest mb-4">
          Capítulos
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mod.chapters.map((chap, i) => (
            <ChapterCard
              key={chap.id}
              chapter={chap}
              index={i}
              onClick={() => goToChapter(chap)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Card de capítulo ───────────────────────────────────────────────────────
function ChapterCard({
  chapter: chap,
  index,
  onClick,
}: {
  chapter: Chapter
  index: number
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * .06, duration: .35, ease: [.16,1,.3,1] }}
      onClick={onClick}
      className="card w-full text-left p-5 flex flex-col gap-3 group
                 hover:border-ocean-300 hover:shadow-ocean-100 hover:shadow-lg
                 active:scale-[.98] transition-all duration-200"
    >
      {/* Ícone + número */}
      <div className="flex items-start justify-between">
        <span className="text-3xl leading-none">{chap.icon}</span>
        <span className="text-xs font-bold text-ink-300 bg-ink-100 rounded-lg px-2 py-1 tabular-nums">
          {String(chap.number).padStart(2, '0')}
        </span>
      </div>

      {/* Título + descrição */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-ink-900 leading-snug mb-1 group-hover:text-ocean-700 transition-colors">
          {chap.title}
        </h3>
        <p className="text-xs text-ink-500 leading-relaxed line-clamp-2">
          {chap.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-ink-400 pt-1 border-t border-ink-100">
        {(chap.imageCount ?? 0) > 0 ? (
          <span className="flex items-center gap-1">
            <Image className="w-3 h-3" /> {chap.imageCount} imagens
          </span>
        ) : <span />}
        <span className="flex items-center gap-0.5 text-ocean-600 font-semibold group-hover:gap-1.5 transition-all">
          Ler <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.button>
  )
}
