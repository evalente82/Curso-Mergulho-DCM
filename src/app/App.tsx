import React, { useEffect, useState } from 'react'
import '../styles.css'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Waves, BookOpen, Search, Menu, X } from 'lucide-react'
import ContentReader from '../features/content/ContentReader'
import ContentSearch from '../features/content/ContentSearch'

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type ContentItem = {
  id: string
  title: string
  excerpt?: string
  tags?: string[]
}

// ─── Constantes de animação ───────────────────────────────────────────────────
const pageVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { duration: .35, ease: [.16,1,.3,1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: .2  } },
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [items, setItems] = useState<ContentItem[]>([])

  useEffect(() => {
    fetch('/content/index.json')
      .then(r => r.json())
      .then(j => setItems(j.items ?? []))
      .catch(() => setItems([]))
  }, [])

  return (
    <BrowserRouter>
      <AppShell items={items} />
    </BrowserRouter>
  )
}

// ─── Shell (Navbar + rotas animadas) ─────────────────────────────────────────
function AppShell({ items }: { items: ContentItem[] }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-ink-50 text-ink-900">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-ocean-900/95 backdrop-blur border-b border-ocean-800 text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <Waves className="w-5 h-5 text-ocean-300" />
            <span>DCM <span className="text-ocean-300">Mergulho</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/">Início</NavLink>
            <NavLink to="/busca">Busca</NavLink>
            <Link to="/ler/curso_mergulho_autonomo_basico" className="btn-primary ml-3 py-1.5 text-xs">
              <BookOpen className="w-4 h-4" /> Ler Apostila
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-ocean-800 transition"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: .2 }}
              className="sm:hidden overflow-hidden border-t border-ocean-800 bg-ocean-950"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                <MobileNavLink to="/" onClick={() => setMenuOpen(false)}>Início</MobileNavLink>
                <MobileNavLink to="/busca" onClick={() => setMenuOpen(false)}>Busca</MobileNavLink>
                <MobileNavLink to="/ler/curso_mergulho_autonomo_basico" onClick={() => setMenuOpen(false)}>
                  Ler Apostila
                </MobileNavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Conteúdo animado ── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"        element={<PageWrapper><HomePage items={items} /></PageWrapper>} />
            <Route path="/busca"   element={<PageWrapper><BuscaPage items={items} /></PageWrapper>} />
            <Route path="/ler/:id" element={<PageWrapper><ContentReader /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-ocean-950 text-ocean-400 text-xs text-center py-4 px-4">
        Defesa Civil Maricá — Curso de Mergulho de Busca e Resgate &nbsp;·&nbsp; Conteúdo protegido · uso interno
      </footer>
    </div>
  )
}

// ─── Wrappers de animação ─────────────────────────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      {children}
    </motion.div>
  )
}

// ─── Componentes de NavLink ───────────────────────────────────────────────────
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="px-3 py-1.5 text-sm rounded-lg text-ocean-200 hover:bg-ocean-800 transition">
      {children}
    </Link>
  )
}
function MobileNavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick}
      className="block px-3 py-2.5 text-sm rounded-lg text-ocean-200 hover:bg-ocean-800 transition">
      {children}
    </Link>
  )
}

// ─── Página Inicial (Dashboard Hero) ─────────────────────────────────────────
function HomePage({ items }: { items: ContentItem[] }) {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-800 to-ocean-950 text-white p-8 md:p-12">
        {/* círculos decorativos */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-ocean-600/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-ocean-400/10 blur-2xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .1, duration: .5 }}
          className="relative z-10 max-w-xl"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ocean-300 mb-3">
            <Waves className="w-4 h-4" /> Defesa Civil Maricá
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            Curso de Mergulho<br />
            <span className="text-ocean-300">Autônomo Básico</span>
          </h1>
          <p className="text-ocean-200 text-sm md:text-base leading-relaxed mb-6">
            Material técnico completo para Guarda-Vidas e equipes de Busca e Resgate.
            Estude offline, em qualquer dispositivo.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/ler/curso_mergulho_autonomo_basico')}
              className="btn-primary"
            >
              <BookOpen className="w-4 h-4" /> Começar a Ler
            </button>
            <button
              onClick={() => navigate('/busca')}
              className="inline-flex items-center gap-2 rounded-xl border border-ocean-500 px-5 py-2.5
                         text-sm font-semibold text-ocean-100 hover:bg-ocean-800 active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" /> Buscar Conteúdo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Cards de módulos */}
      <section>
        <h2 className="text-lg font-bold text-ink-700 mb-4">Módulos disponíveis</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card h-36 animate-pulse bg-ink-100" />
              ))
            : items.map((item, i) => (
                <ModuleCard key={item.id} item={item} index={i} />
              ))}
        </div>
      </section>

      {/* Destaques / badges */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '🌊', label: 'Mergulho Autônomo' },
          { icon: '🤿', label: 'Equipamentos' },
          { icon: '🆘', label: 'Busca e Resgate' },
          { icon: '📶', label: 'Funciona Offline' },
        ].map(({ icon, label }) => (
          <div key={label} className="card flex flex-col items-center gap-2 py-5 px-3 text-center">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-semibold text-ink-600">{label}</span>
          </div>
        ))}
      </section>
    </div>
  )
}

// ─── Card de módulo ───────────────────────────────────────────────────────────
function ModuleCard({ item, index }: { item: ContentItem; index: number }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * .07, duration: .35, ease: [.16,1,.3,1] }}
      className="card p-5 cursor-pointer group"
      onClick={() => navigate(`/ler/${item.id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-ocean-100 flex items-center justify-center shrink-0
                        group-hover:bg-ocean-200 transition-colors">
          <BookOpen className="w-5 h-5 text-ocean-600" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-ink-900 line-clamp-2 leading-snug mb-1">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed">{item.excerpt}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        {item.tags?.length ? (
          <span className="text-xs text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full font-medium">
            {item.tags[0]}
          </span>
        ) : <span />}
        <span className="text-xs text-ocean-600 font-semibold group-hover:underline">Ler →</span>
      </div>
    </motion.div>
  )
}

// ─── Página de busca ──────────────────────────────────────────────────────────
function BuscaPage({ items }: { items: ContentItem[] }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink-800 mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-ocean-500" /> Buscar no Conteúdo
      </h1>
      <ContentSearch items={items} />
    </div>
  )
}

