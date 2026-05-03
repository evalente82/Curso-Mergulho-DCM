const fs = require('fs')
const path = require('path')

const slug = 'curso_mergulho_autonomo_basico'
const base = path.resolve(process.cwd(), 'content', 'raw', slug)
const mdFile = base + '.md'
const variants = [base + '.utf8.layout.txt', base + '.utf8.raw.txt', base + '.win1252.layout.txt']

function score(s){
  if(!s) return 0
  // score by count of Portuguese accented letters and common punctuation
  const m = s.match(/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g) || []
  const punct = (s.match(/[”“—–«»…]/g) || []).length
  return m.length + punct
}

const results = variants.map(v=>{
  if(!fs.existsSync(v)) return {file:v, score: -1, text: null}
  const text = fs.readFileSync(v,'utf8')
  return {file:v, score: score(text), text}
})

results.sort((a,b)=>b.score-a.score)
console.log('Scores:')
results.forEach(r=> console.log(r.file, r.score))

const best = results.find(r=>r.score>=0)
if(!best || !best.text){
  console.error('No extraction available')
  process.exit(1)
}

// Read existing MD, preserve frontmatter and images section (## Imagens)
let md = ''
if(fs.existsSync(mdFile)) md = fs.readFileSync(mdFile,'utf8')
let front = ''
let rest = ''
const fm = md.match(/^(---\n[\s\S]*?\n---\n)/)
if(fm){ front = fm[1]; rest = md.slice(fm[1].length) }
else { rest = md }

// split images section
let imgsSection = ''
let body = rest
const idx = rest.indexOf('\n## Imagens')
if(idx!==-1){ imgsSection = rest.slice(idx); body = rest.slice(0, idx) }

// replace body with best.text (trim) and recompose
const newBody = '\n' + best.text.trim() + '\n\n'
const newMd = (front || '---\nid: '+slug+'\n---\n\n') + newBody + imgsSection
fs.writeFileSync(mdFile, newMd, 'utf8')
console.log('Applied best extraction from', best.file, 'to', mdFile)
