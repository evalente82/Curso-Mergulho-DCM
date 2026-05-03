import React, { useEffect, useState } from 'react'
import '../styles.css'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Waves, BookOpen, Search, Menu, X, Construction, Wifi } from 'lucide-react'
import ContentSearch from '../features/content/ContentSearch'
import ModulePage from '../features/module/ModulePage'
import ChapterReader from '../features/module/ChapterReader'
import { assetUrl } from '../shared/basePath'

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
// Em produção (GitHub Pages) o basename é /Curso-Mergulho-DCM, em dev é /
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <AppShell />
    </BrowserRouter>
  )
}

// ─── Shell (Navbar + rotas animadas) ─────────────────────────────────────────
function AppShell() {
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
            <Link to="/modulo/curso_mergulho_autonomo_basico" className="btn-primary ml-3 py-1.5 text-xs">
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
                <MobileNavLink to="/modulo/curso_mergulho_autonomo_basico" onClick={() => setMenuOpen(false)}>
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
            <Route path="/"                          element={<PageWrapper><HomePage items={[]} /></PageWrapper>} />
            <Route path="/busca"                     element={<PageWrapper><BuscaPage /></PageWrapper>} />
            <Route path="/em-construcao"             element={<PageWrapper><EmConstrucaoPage /></PageWrapper>} />
            <Route path="/modulo/:moduleId"          element={<PageWrapper><ModulePage /></PageWrapper>} />
            <Route path="/modulo/:moduleId/:chapterId" element={<ChapterReader />} />
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
function HomePage({ items: _items }: { items: unknown[] }) {
  const navigate = useNavigate()

  const modulos = [
    {
      icon: '🌊',
      emoji: '🤿',
      label: 'Mergulho Autônomo',
      desc: 'Física, fisiologia, equipamentos e procedimentos de mergulho.',
      to: '/modulo/curso_mergulho_autonomo_basico',
      available: true,
    },
    {
      icon: '🛟',
      emoji: '🦺',
      label: 'Equipamentos',
      desc: 'Cilindros, reguladores, coletes e manutenção de equipamentos.',
      to: '/em-construcao',
      available: false,
    },
    {
      icon: '🆘',
      emoji: '🏥',
      label: 'Busca e Resgate',
      desc: 'Técnicas operacionais para missões aquáticas de busca e resgate.',
      to: '/em-construcao',
      available: false,
    },
    {
      icon: '📶',
      emoji: '💾',
      label: 'Funciona Offline',
      desc: 'Todo o conteúdo disponível sem conexão após o primeiro acesso.',
      to: '/em-construcao',
      available: false,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-800 to-ocean-950 text-white p-8 md:p-12">
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
            <button onClick={() => navigate('/modulo/curso_mergulho_autonomo_basico')} className="btn-primary">
              <BookOpen className="w-4 h-4" /> Acessar Apostila
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

      {/* Módulos */}
      <section>
        <h2 className="text-base font-bold text-ink-700 mb-4">Módulos do Curso</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modulos.map(({ icon, label, desc, to, available }, i) => (
            <motion.button
              key={label}
              onClick={() => navigate(to)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * .07, duration: .35, ease: [.16,1,.3,1] }}
              className="card p-5 text-left flex flex-col gap-3 group hover:border-ocean-300 hover:shadow-md active:scale-[.98] transition-all cursor-pointer relative"
            >
              {!available && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 leading-tight">
                  Em breve
                </span>
              )}
              <span className="text-3xl">{icon}</span>
              <div>
                <p className={`font-bold text-sm mb-1 transition-colors line-clamp-1 ${available ? 'text-ink-900 group-hover:text-ocean-700' : 'text-ink-400'}`}>
                  {label}
                </p>
                <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed">{desc}</p>
              </div>
              {available && (
                <span className="text-xs text-ocean-600 font-semibold self-end">Acessar →</span>
              )}
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Página de busca ──────────────────────────────────────────────────────────
function BuscaPage() {
  const [items, setItems] = useState<ContentItem[]>([])

  useEffect(() => {
    fetch(assetUrl('/content/index.json'))
      .then(r => r.json())
      .then(idx => {
        // Monta lista de busca a partir dos capítulos
        const chapters = idx.modules?.[0]?.chapters ?? []
        setItems(chapters.map((c: { id: string; moduleId: string; title: string; description: string }) => ({
          id: `${c.moduleId}/${c.id}`,
          title: c.title,
          excerpt: c.description,
        })))
      })
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink-800 mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-ocean-500" /> Buscar no Conteúdo
      </h1>
      <ContentSearch items={items} />
    </div>
  )
}

// ─── Página Em Construção ─────────────────────────────────────────────────────
function EmConstrucaoPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
      <motion.div
        initial={{ scale: .8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-24 h-24 rounded-3xl bg-amber-100 flex items-center justify-center"
      >
        <Construction className="w-12 h-12 text-amber-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .15, duration: .4 }}
      >
        <h1 className="text-2xl font-extrabold text-ink-900 mb-2">Módulo em construção</h1>
        <p className="text-ink-500 text-sm leading-relaxed max-w-sm mx-auto">
          Este conteúdo está sendo preparado pela equipe da Defesa Civil Maricá
          e estará disponível em breve. Aguarde as próximas atualizações!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: .3 }}
        className="flex gap-3"
      >
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          <Waves className="w-4 h-4" /> Voltar ao Início
        </button>
        <button
          onClick={() => navigate('/modulo/curso_mergulho_autonomo_basico')}
          className="inline-flex items-center gap-2 rounded-xl border border-ocean-400 px-5 py-2.5
                     text-sm font-semibold text-ocean-700 hover:bg-ocean-50 active:scale-95 transition-all"
        >
          <BookOpen className="w-4 h-4" /> Ler Apostila
        </button>
      </motion.div>

      {/* Badge de offline disponível */}
      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
        <Wifi className="w-4 h-4" />
        O módulo de Mergulho Autônomo já está disponível offline
      </div>
    </div>
  )
}
