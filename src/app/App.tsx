import React, { useEffect, useState } from 'react'
import '../styles.css'
import { motion } from 'framer-motion'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ContentList from '../features/content/ContentList'
import ContentReader from '../features/content/ContentReader'

export default function App() {
  const [items, setItems] = useState<{id:string;title:string}[]>([])
  useEffect(()=>{
    fetch('/content/index.json').then(r=>r.json()).then((j)=> setItems(j.items || [] )).catch(()=> setItems([]))
  },[])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="p-4 border-b bg-white flex items-center justify-between">
          <motion.h1 className="text-xl font-bold">Curso Mergulho DCM</motion.h1>
          <nav>
            <Link to="/" className="mr-4 text-sm text-gray-600">Home</Link>
            <Link to="/content" className="text-sm text-gray-600">Conteúdo</Link>
          </nav>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<div>Bem vindo ao scaffold inicial.</div>} />
            <Route path="/content" element={<ContentList items={items} />} />
            <Route path="/content/:id" element={<ContentRoute />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function ContentRoute(){
  const { pathname } = window.location
  const id = pathname.replace('/content/','')
  return <ContentReader id={id} />
}
