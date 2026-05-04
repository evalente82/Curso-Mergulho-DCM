/**
 * fix-frontmatter-encoding.js
 * Corrige o encoding UTF-8 corrompido nos títulos do frontmatter
 * dos capítulos. Lê cada arquivo como latin1 e reescreve como UTF-8.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const chaptersDir = join(process.cwd(), 'public', 'content', 'chapters')
const files = readdirSync(chaptersDir).filter(f => f.endsWith('.md'))

const titleFix = {
  'capa':              'Apresentação',
  'historia-mergulho': 'História do Mergulho',
  'certificadoras':    'Certificadoras',
  'equipamentos':      'Equipamentos',
  'fisica-mergulho':   'Física Aplicada ao Mergulho',
  'fisiologia':        'Fisiologia do Mergulho',
  'tabelas-descomp':   'Tabelas de Descompressão',
  'procedimentos':     'Procedimentos, Técnica e Sinais',
  'animais-marinhos':  'Animais Marinhos',
}

let fixed = 0

for (const file of files) {
  const filePath = join(chaptersDir, file)
  // Lê os bytes brutos como latin1 para preservar o conteúdo exato
  const raw = readFileSync(filePath, 'latin1')

  const idMatch = raw.match(/id:\s*"?([^"\n]+)"?/)
  if (!idMatch) continue

  const id = idMatch[1].trim()
  const correctTitle = titleFix[id]
  if (!correctTitle) continue

  const corrected = raw.replace(/title:\s*".+"/, `title: "${correctTitle}"`)

  if (corrected !== raw) {
    // Grava de volta mantendo os bytes do conteúdo do corpo como estão
    writeFileSync(filePath, Buffer.from(corrected, 'latin1'))
    console.log(`Corrigido: ${file}`)
    fixed++
  } else {
    console.log(`Sem mudanca: ${file}`)
  }
}

console.log(`\n${fixed} arquivo(s) corrigido(s).`)
