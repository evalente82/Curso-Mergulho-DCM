import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

type Item = { id: string; title: string; excerpt?: string }

export default function ContentList({ items = [] }: { items?: Item[] }) {
  const navigate = useNavigate()
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      <h2 className="text-2xl font-bold text-ink-800 mb-6">Conteúdo</h2>
      {items.map(it => (
        <button
          key={it.id}
          onClick={() => navigate(`/ler/${it.id}`)}
          className="w-full card p-4 text-left flex items-center gap-3 hover:bg-ocean-50 transition-colors"
        >
          <BookOpen className="w-5 h-5 text-ocean-500 shrink-0" />
          <div>
            <p className="font-semibold text-sm text-ink-800">{it.title}</p>
            {it.excerpt && <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{it.excerpt}</p>}
          </div>
        </button>
      ))}
    </div>
  )
}

