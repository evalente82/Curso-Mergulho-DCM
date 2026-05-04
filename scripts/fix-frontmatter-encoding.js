/**
 * fix-frontmatter-encoding.js
 * Converte todos os capítulos de latin1 → UTF-8.
 * O split-chapters.js gerou os arquivos com encoding latin1.
 * O Decap CMS (e a web em geral) exige UTF-8.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const chaptersDir = join(process.cwd(), 'public', 'content', 'chapters')
const files = readdirSync(chaptersDir).filter(f => f.endsWith('.md'))

let converted = 0

for (const file of files) {
  const filePath = join(chaptersDir, file)

  // Lê como latin1: cada byte vira o codepoint equivalente (0x00–0xFF)
  const latin1Content = readFileSync(filePath, 'latin1')

  // Verifica se já é UTF-8 válido (evita dupla conversão)
  const asBuffer = Buffer.from(latin1Content, 'latin1')
  const roundtrip = asBuffer.toString('utf8')
  if (roundtrip === latin1Content) {
    console.log(`⏭  Já é UTF-8: ${file}`)
    continue
  }

  // Grava como UTF-8 — cada codepoint U+00E3 (ã) vira os bytes 0xC3 0xA3
  writeFileSync(filePath, latin1Content, 'utf8')
  console.log(`✅ Convertido latin1→UTF-8: ${file}`)
  converted++
}

console.log(`\n${converted} arquivo(s) convertido(s) para UTF-8.`)
