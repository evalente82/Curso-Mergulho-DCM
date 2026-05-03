const fs = require('fs')
const path = require('path')

const SLUG = 'curso_mergulho_autonomo_basico'
const MD = path.resolve(process.cwd(), 'content', 'raw', SLUG + '.md')
const IMG_DIR = path.resolve(process.cwd(), 'public', 'assets', 'content', SLUG, 'img')

if (!fs.existsSync(MD)){
  console.error('Markdown not found:', MD); process.exit(1)
}
const imgs = fs.existsSync(IMG_DIR) ? fs.readdirSync(IMG_DIR).filter(f=>/\.(png|jpg|jpeg)$/i.test(f)) : []
let md = fs.readFileSync(MD, 'utf8')

// preserve frontmatter
const fmMatch = md.match(/^(---\n[\s\S]*?\n---\n)/)
const front = fmMatch ? fmMatch[1] : ''
const body = fmMatch ? md.slice(front.length) : md

// split by page numbers heuristically: lines that contain only a number
const parts = body.split(/\n\s*\n\s*\d{1,3}\s*\n\s*\n/)

let outParts = []
for(let i=0;i<parts.length;i++){
  outParts.push(parts[i])
  const img = imgs[i]
  if (img){
    outParts.push(`\n\n![](/assets/content/${SLUG}/img/${img})\n\n`)
  }
}

const newMd = front + outParts.join('\n')
fs.writeFileSync(MD, newMd, 'utf8')
console.log('Injected', Math.min(parts.length, imgs.length), 'images into', MD)
