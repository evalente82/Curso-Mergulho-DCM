import React, { useEffect, useState } from 'react'
import FlexSearch from 'flexsearch'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen } from 'lucide-react'
import type { ContentItem } from '../../app/App'

export default function ContentSearch({ items }: { items: ContentItem[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [idx, setIdx]         = useState<any | null>(null)
  const [q, setQ]             = useState('')
  const [results, setResults] = useState<ContentItem[]>([])
  const navigate = useNavigate()

  // Constrói índice quando items chegam
  useEffect(() => {
    if (!items.length) return
    const index = new (FlexSearch as any).Index({ tokenize: 'forward', cache: true })
    items.forEach((it, i) => index.add(i, `${it.title} ${it.excerpt ?? ''}`))
    setIdx(index)
  }, [items])

  // Executa busca
  useEffect(() => {
    if (!idx || !q.trim()) return setResults([])
    const ids = idx.search(q, 10) as number[]
    setResults(ids.map(i => items[i]).filter(Boolean))
  }, [q, idx, items])

  const empty = q.length > 1 && results.length === 0

  return (
    <div className="space-y-4">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
        <input
          autoFocus
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Digite uma palavra-chave…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-200 bg-white shadow-sm
                     text-sm text-ink-900 placeholder-ink-400
                     focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition"
        />
      </div>

      {/* Resultados */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {results.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * .05 }}
              >
                <button
                  onClick={() => {
                    const [modId, chapId] = item.id.split('/')
                    const base = chapId ? `/modulo/${modId}/${chapId}` : `/modulo/${modId}`
                    const qs   = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
                    navigate(base + qs)
                  }}
                  className="w-full card p-4 text-left flex items-start gap-3 hover:bg-ocean-50 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-ocean-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-ink-800">{item.title}</p>
                    {item.excerpt && (
                      <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{item.excerpt}</p>
                    )}
                  </div>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {empty && (
        <p className="text-sm text-ink-400 text-center py-8">
          Nenhum resultado para "<strong>{q}</strong>"
        </p>
      )}

      {!q && (
        <p className="text-xs text-ink-400 text-center py-4">
          Busca em todo o conteúdo da apostila, funciona offline.
        </p>
      )}
    </div>
  )
}

