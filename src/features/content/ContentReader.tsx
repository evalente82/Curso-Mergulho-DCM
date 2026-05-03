import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ContentReader({ id }: { id: string }) {
  const [md, setMd] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(16)
  useEffect(() => {
    fetch(`/content/raw/${id}.md`).then((r) => {
      if (!r.ok) throw new Error('not found')
      return r.text()
    }).then(setMd).catch(() => setMd('# Erro\nConteúdo não encontrado'))
  }, [id])

  if (!md) return <div className="p-4">Carregando...</div>

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-x-2">
          <button className="px-3 py-1 border rounded" onClick={()=> window.history.back()}>Voltar</button>
          <button className="px-3 py-1 border rounded" onClick={()=> setFontSize(s=>Math.max(12,s-2))}>A-</button>
          <button className="px-3 py-1 border rounded" onClick={()=> setFontSize(s=>Math.min(28,s+2))}>A+</button>
        </div>
        <div className="text-sm text-gray-600">Fonte: {fontSize}px</div>
      </div>

      <article className="prose max-w-none" style={{ fontSize }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </article>
    </div>
  )
}
