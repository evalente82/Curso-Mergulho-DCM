/**
 * apply-manifest.mjs
 *
 * Lê scripts/images-manifest.json e renomeia os arquivos de imagem
 * de img-000.jpg → fisiologia_plasma_funcoes.jpg etc.
 *
 * Execute APÓS extract-by-position.mjs.
 * Você pode editar o campo "newName" no manifesto antes de rodar este script.
 */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const IMG_DIR    = path.join(__dirname, '..', 'public', 'assets', 'content', 'curso_mergulho_autonomo_basico', 'img')
const MANIFEST   = path.join(__dirname, 'images-manifest.json')

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))

let renamed = 0
let skipped = 0

for (const [origName, info] of Object.entries(manifest)) {
  const src = path.join(IMG_DIR, origName)
  const dst = path.join(IMG_DIR, info.newName)

  if (!fs.existsSync(src)) {
    console.log(`⚠ Não encontrado: ${origName}`)
    skipped++
    continue
  }

  if (src === dst) {
    skipped++
    continue
  }

  // Se destino já existe com outro conteúdo, adicionar sufixo
  let finalDst = dst
  if (fs.existsSync(dst)) {
    const ext  = path.extname(dst)
    const base = path.basename(dst, ext)
    finalDst   = path.join(IMG_DIR, `${base}_2${ext}`)
  }

  fs.renameSync(src, finalDst)
  console.log(`  ${origName} → ${path.basename(finalDst)}`)
  renamed++
}

console.log(`\n✅ ${renamed} imagens renomeadas, ${skipped} ignoradas.`)
