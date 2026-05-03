/**
 * map-image-pages.js
 *
 * Usa pdfjs-dist para varrer o PDF operador a operador e detectar em qual
 * página cada imagem (XObject do tipo Image) aparece.
 * 
 * Salva: scripts/image-page-map.json  →  { "img-000.jpg": 2, "img-001.jpg": 10, ... }
 */

const path = require('path')
const fs   = require('fs')

async function main() {
  // pdfjs-dist v4+ usa somente ESM (.mjs)
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

  const PDF_PATH  = path.join(__dirname, '..', 'content', 'raw_pdfs', 'curso_mergulho_autonomo_basico.pdf')
  const IMG_DIR   = path.join(__dirname, '..', 'public', 'assets', 'content', 'curso_mergulho_autonomo_basico', 'img')
  const OUT_FILE  = path.join(__dirname, 'image-page-map.json')

  // Lista de imagens extraídas em ordem PDF (mesma ordem do pdfimages)
  const images = fs.readdirSync(IMG_DIR)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .sort()

  console.log('Imagens encontradas:', images.length)

  const data     = new Uint8Array(fs.readFileSync(PDF_PATH))
  const loadTask = pdfjsLib.getDocument({ data, verbosity: 0 })
  const pdfDoc   = await loadTask.promise

  console.log('Total páginas PDF:', pdfDoc.numPages)

  // Contar imagens por página varrendo os operadores de cada página
  const imgsPerPage = []   // imgsPerPage[i] = número de imagens na página i+1

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page     = await pdfDoc.getPage(pageNum)
    const opList   = await page.getOperatorList()
    
    // OPS.paintImageXObject = 85, OPS.paintInlineImageXObject = 86, etc.
    const IMAGE_OPS = new Set([
      pdfjsLib.OPS.paintImageXObject,
      pdfjsLib.OPS.paintInlineImageXObject,
      pdfjsLib.OPS.paintImageMaskXObject,
      pdfjsLib.OPS.paintXObject,
    ])

    let count = 0
    for (const op of opList.fnArray) {
      if (IMAGE_OPS.has(op)) count++
    }
    imgsPerPage.push(count)
    if (count > 0) process.stdout.write(`  página ${pageNum}: ${count} img(s)\n`)
  }

  // Mapear imagem[i] (em ordem PDF) → número de página
  // Expandindo o array imgsPerPage em uma lista sequencial
  const imagePageList = []
  imgsPerPage.forEach((count, idx) => {
    for (let k = 0; k < count; k++) {
      imagePageList.push(idx + 1)   // 1-based
    }
  })

  console.log('\nTotal imagens detectadas no PDF:', imagePageList.length)
  console.log('Total imagens extraídas:', images.length)

  // Montar mapa final  { "img-000.jpg": pageNum, ... }
  const pageMap = {}
  images.forEach((img, i) => {
    pageMap[img] = imagePageList[i] || null
  })

  fs.writeFileSync(OUT_FILE, JSON.stringify(pageMap, null, 2), 'utf8')
  console.log('\n✅ Mapa salvo em scripts/image-page-map.json')
  
  // Amostra
  console.log('\nAmostra:')
  images.slice(0, 10).forEach(img => {
    console.log(`  ${img} → página ${pageMap[img]}`)
  })
}

main().catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
