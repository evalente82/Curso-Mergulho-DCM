const fs = require('fs')
const path = require('path')

const RAW = path.resolve(process.cwd(), 'content', 'raw')

const MAP = {
  'Ã¡':'á','Ã¢':'â','Ã£':'ã','Ã¤':'ä','Ã§':'ç','Ã¨':'è','Ã©':'é','Ãª':'ê','Ã«':'ë',
  'Ã¬':'ì','Ã­':'í','Ã®':'î','Ã¯':'ï','Ã±':'ñ','Ã²':'ò','Ã³':'ó','Ã´':'ô','Ãµ':'õ','Ã¶':'ö',
  'Ã¹':'ù','Ãº':'ú','Ã»':'û','Ã¼':'ü','Ãš':'Ú','Ã©':'é','Ã‰':'É','Ã€':'À','Ã¢':'â',
  'ÃƒÂ¡':'á','ÃƒÂª':'ê','ÃƒÂ£':'ã','ÃƒÂ©':'é','ÃƒÂ§':'ç','ÃƒÂº':'ú','ÃƒÂ´':'ô','ÃƒÂ³':'ó',
  'â€”':'—','â€“':'–','â€˜':'‘','â€™':'’','â€œ':'“','â€�':'”','â€¢':'•','â€¦':'…','Âº':'º','Âª':'ª',
  'Ã‚':'Â','Â ':' ', 'Ã‚Â':'', 'Ãƒ':'', 'Ã‚â€™':'’'
}

function fixText(s){
  let out = s
  // first remove stray control sequences
  out = out.replace(/\r\n/g,'\n')
  out = out.replace(/\u00A0/g,' ')
  out = out.replace(/\u0092/g,"'")
  // apply mappings many times to catch nested cases
  for(let i=0;i<3;i++){
    for(const k in MAP){
      out = out.split(k).join(MAP[k])
    }
  }
  // remove isolated Â characters
  out = out.replace(/\bÂ\b/g,'')
  out = out.replace(/Â(?=\s)/g,'')
  // trim repeated spaces
  out = out.replace(/ +/g,' ')
  return out
}

function walk(dir){
  if(!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).flatMap(f=>{
    const p = path.join(dir,f)
    const st = fs.statSync(p)
    if(st.isDirectory()) return walk(p)
    if(p.endsWith('.md') || p.endsWith('.txt')) return [p]
    return []
  })
}

const files = walk(RAW)
let changed = 0
for(const f of files){
  const raw = fs.readFileSync(f,'utf8')
  const fixed = fixText(raw)
  if(fixed !== raw){
    fs.writeFileSync(f, fixed, 'utf8')
    changed++
    console.log('Fixed', f)
  }
}
console.log('Files processed:', files.length, 'changed:', changed)
