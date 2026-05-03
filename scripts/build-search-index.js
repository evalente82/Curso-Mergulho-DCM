const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const FlexSearch = require('flexsearch')

const RAW_DIR = path.resolve(process.cwd(), 'content', 'raw')
const OUT = path.resolve(process.cwd(), 'content', 'index.json')

const files = fs.readdirSync(RAW_DIR).filter(f=>f.endsWith('.md'))
const items = files.map((f)=>{
  const raw = fs.readFileSync(path.join(RAW_DIR,f),'utf8')
  const m = matter(raw)
  const id = path.basename(f,'.md')
  return { id, title: m.data.title || id, body: m.content || '' }
})

// Output items with body; client will build a FlexSearch index from this
fs.writeFileSync(OUT, JSON.stringify({ items: items.map(({id,title,body})=>({id,title,excerpt: body.slice(0,400).replace(/\n+/g,' '), body})) }, null, 2), 'utf8')
console.log('Wrote content index to', OUT)
