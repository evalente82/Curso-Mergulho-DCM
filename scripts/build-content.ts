import fs from 'fs'
import path from 'path'

const RAW_DIR = path.resolve(process.cwd(), 'content', 'raw')
const OUT_INDEX = path.resolve(process.cwd(), 'content', 'index.json')

function walkRaw(): Array<{ id: string; title: string; path: string }> {
  if (!fs.existsSync(RAW_DIR)) return []
  const files = fs.readdirSync(RAW_DIR)
  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ id: path.basename(f, '.md'), title: path.basename(f, '.md'), path: `content/raw/${f}` }))
}

function buildIndex() {
  const items = walkRaw()
  fs.writeFileSync(OUT_INDEX, JSON.stringify(items, null, 2), 'utf-8')
  console.log('Wrote', OUT_INDEX)
}

buildIndex()
