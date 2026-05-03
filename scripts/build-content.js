const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const CONTENT_DIR = path.resolve(process.cwd(), 'content', 'raw')
const OUT = path.resolve(process.cwd(), 'content', 'index.json')

function build(){
  if (!fs.existsSync(CONTENT_DIR)){
    console.log('No content/raw directory')
    fs.writeFileSync(OUT, JSON.stringify({ items: [] }, null, 2), 'utf8')
    return
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))
  const items = files.map((f) => {
    const full = path.join(CONTENT_DIR, f)
    const raw = fs.readFileSync(full, 'utf8')
    const m = matter(raw)
    const id = path.basename(f, '.md')
    const title = m.data.title || id
    const excerpt = (m.content || '').slice(0, 400).replace(/\n+/g,' ')
    return { id, title, excerpt, path: `content/raw/${f}` }
  })

  fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2), 'utf8')
  console.log('Wrote', OUT)
}

build()
