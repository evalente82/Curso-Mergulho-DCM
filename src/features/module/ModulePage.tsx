import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ModuleDashboard, { type Module } from './ModuleDashboard'
import { assetUrl } from '../../shared/basePath'

export default function ModulePage() {
  const { moduleId = 'curso_mergulho_autonomo_basico' } = useParams<{ moduleId: string }>()
  const [mod, setMod] = useState<Module | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(assetUrl('/content/index.json'))
      .then(r => r.json())
      .then(idx => {
        const found = (idx.modules as Module[])?.find((m: Module) => m.id === moduleId)
        if (found) setMod(found)
        else setError(true)
      })
      .catch(() => setError(true))
  }, [moduleId])

  if (error) return (
    <div className="flex items-center justify-center min-h-[50vh] text-ink-400 text-sm">
      Módulo não encontrado.
    </div>
  )

  if (!mod) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 rounded-full border-4 border-ocean-300 border-t-ocean-600 animate-spin" />
    </div>
  )

  return <ModuleDashboard module={mod} />
}
