/**
 * Retorna a URL correta para assets/fetch levando em conta o BASE_URL do Vite.
 * - Dev:        BASE_URL = "/"        → "/content/index.json"
 * - Produção:   BASE_URL = "/Curso-Mergulho-DCM/"  → "/Curso-Mergulho-DCM/content/index.json"
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') // remove trailing slash
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
