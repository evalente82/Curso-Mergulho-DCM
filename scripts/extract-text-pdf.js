const fs = require('fs')
const path = require('path')
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')

const PDF_DIR = path.resolve(process.cwd(), 'content', 'raw_pdfs')
const OUT_DIR = path.resolve(process.cwd(), 'content', 'raw')

async function extractTextFromPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath))
  const loadingTask = pdfjsLib.getDocument({ data })
  const doc = await loadingTask.promise
  let fullText = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map((item) => item.str)
    fullText += strings.join(' ') + '\n\n'
  }
  return fullText
}

async function run() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error('No PDFs found in', PDF_DIR)
    process.exit(1)
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const files = fs.readdirSync(PDF_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'))
  for (const f of files) {
    try {
      const src = path.join(PDF_DIR, f)
      console.log('Processing', src)
      const text = await extractTextFromPdf(src)
      const slug = path.basename(f, path.extname(f)).toLowerCase().replace(/\s+/g, '-')
      const outPath = path.join(OUT_DIR, `${slug}.md`)
      const header = `---\ntitle: "${slug.replace(/-/g, ' ')}"\nsource: raw_pdfs/${f}\n---\n\n`
      fs.writeFileSync(outPath, header + text, 'utf-8')
      console.log('Wrote', outPath)
    } catch (err) {
      console.error('Failed to process', f, err)
    }
  }
}

run()
