import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ContentReader({ id }: { id: string }) {
  const [md, setMd] = useState<string | null>(null)
  useEffect(() => {
    fetch(`/content/raw/${id}.md`).then((r) => {
      if (!r.ok) throw new Error('not found')
      return r.text()
    }).then(setMd).catch(() => setMd('# Erro\nConteúdo não encontrado'))
  }, [id])

  if (!md) return <div className="p-4">Carregando...</div>

  return (
    <div className="prose max-w-none p-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
    </div>
  )
}
