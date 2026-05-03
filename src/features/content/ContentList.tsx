import React from 'react'
import { Link } from 'react-router-dom'
import ContentSearch from './ContentSearch'

type Item = { id: string; title: string }

export default function ContentList({ items }: { items: Item[] }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Conteúdo</h2>
      <ContentSearch />
      <ul className="space-y-2 mt-4">
        {items.map((it) => (
          <li key={it.id}>
            <Link to={`/content/${it.id}`} className="text-blue-600 hover:underline">
              {it.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
