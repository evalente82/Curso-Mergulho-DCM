const fs = require('fs')
const path = require('path')

const RAW_DIR = path.resolve(process.cwd(), 'content', 'raw')

function fixFile(file){
  const buf = fs.readFileSync(file)
  // Try to detect if file has many replacement chars; if so reinterpret as latin1
  const textUtf8 = buf.toString('utf8')
  const replacerCount = (textUtf8.match(/�/g) || []).length
  if (replacerCount === 0 && isMostlyValidUtf8(textUtf8)){
    // still, some characters may be mojibake (Ã¡ etc). We'll try latin1 decode and choose better.
    const latin = buf.toString('latin1')
    if (scoreText(latin) > scoreText(textUtf8)){
      writeFile(file, latin)
      return true
    }
    return false
  } else {
    const latin = buf.toString('latin1')
    writeFile(file, latin)
    return true
  }
}

function writeFile(file, content){
  // normalize frontmatter id if present as broken
  content = content.replace(/---\s*\nid:\s*\n([a-zA-Z0-9_\-]+)\s*/m, '---\nid: $1\n')
  fs.writeFileSync(file, content, 'utf8')
}

function isMostlyValidUtf8(s){
  // heuristic: count sequences of Ã and other common mojibake markers
  const mojibake = (s.match(/Ã|Â|â|�/g) || []).length
  return mojibake < 5
}

function scoreText(s){
  // higher score if contains many accented letters common in pt-BR
  const matches = s.match(/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g)||[]
  return matches.length
}

function walk(dir){
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).flatMap((f)=>{
    const full = path.join(dir,f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) return walk(full)
    if (f.endsWith('.md') || f.endsWith('.txt')) return [full]
    return []
  })
}

const files = walk(RAW_DIR)
let changed = 0
for(const f of files){
  const ok = fixFile(f)
  if (ok) changed++
}
console.log('Files processed:', files.length, 'changed:', changed)
