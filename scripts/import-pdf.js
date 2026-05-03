const fs = require('fs')
const path = require('path')
const pdf = require('pdf-parse')

const PDF_DIR = path.resolve(process.cwd(), 'content', 'raw_pdfs')
const OUT_DIR = path.resolve(process.cwd(), 'content', 'raw')

async function processOne(file) {
  const data = fs.readFileSync(path.join(PDF_DIR, file))
  const res = await pdf(data)
  const text = res.text || ''
  const slug = path.basename(file, path.extname(file)).toLowerCase().replace(/\s+/g, '-')
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, `${slug}.md`)
  const header = `---\ntitle: "${slug.replace(/-/g, ' ')}"\nsource: raw_pdfs/${file}\n---\n\n`
  fs.writeFileSync(outPath, header + text, 'utf-8')
  console.log('Wrote', outPath)
}

async function run() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error('No PDFs found in', PDF_DIR)
    process.exit(1)
  }
  const files = fs.readdirSync(PDF_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'))
  for (const f of files) {
    try {
      await processOne(f)
    } catch (err) {
      console.error('Failed to process', f, err)
    }
  }
}

run()
