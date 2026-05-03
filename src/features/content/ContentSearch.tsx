import React, { useEffect, useState } from 'react'
import FlexSearch from 'flexsearch'
import { Link } from 'react-router-dom'

export default function ContentSearch(){
  const [items, setItems] = useState<any[]>([])
  const [idx, setIdx] = useState<any|null>(null)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])

  useEffect(()=>{
    fetch('/content/index.json').then(r=>r.json()).then(j=>{
      setItems(j.items || [])
      const index = new (FlexSearch as any).Index({ tokenize: 'forward', cache: true })
      (j.items||[]).forEach((it:any, i:number)=> index.add(i, (it.title+' '+it.excerpt)))
      setIdx(index)
    }).catch(()=>{})
  },[])

  useEffect(()=>{
    if (!idx || !q) return setResults([])
    const ids = idx.search(q, 10) as number[]
    setResults(ids.map((i)=> items[i]))
  },[q, idx, items])

  return (
    <div className="p-4">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." className="border p-2 w-full mb-3" />
      <ul>
        {results.map((r, idx)=>(
          <li key={r.id}><Link to={`/content/${r.id}`} className="text-blue-600">{r.title}</Link></li>
        ))}
      </ul>
    </div>
  )
}
