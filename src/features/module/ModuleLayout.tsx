import React from 'react'
import { Link } from 'react-router-dom'

export default function ModuleLayout({children}:{children:React.ReactNode}){
  return (
    <div className="max-w-5xl mx-auto">
      <header className="py-8">
        <h1 className="text-3xl font-extrabold">Módulo: Mergulho Autônomo — Básico</h1>
        <p className="text-gray-600 mt-2">Manual completo convertido para leitura offline com imagens e índice.</p>
      </header>
      <div className="grid grid-cols-4 gap-6">
        <aside className="col-span-1 p-4 border rounded bg-white">
          <h3 className="font-semibold mb-2">Sumário</h3>
          <ul className="text-sm space-y-1">
            <li><Link to="/content/curso_mergulho_autonomo_basico" className="text-blue-600">Manual - Início</Link></li>
          </ul>
        </aside>
        <section className="col-span-3 bg-white rounded p-4">
          {children}
        </section>
      </div>
    </div>
  )
}
