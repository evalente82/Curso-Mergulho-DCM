const fs = require('fs');
const path = require('path');

const fp = path.join(__dirname, '..', 'ROADMAP.md');
const existing = fs.readFileSync(fp, 'utf8');

// Evita duplicar se já foi adicionado
if (existing.includes('REGRA DE OURO — ENCODING UTF-8')) {
  console.log('Seção de encoding já existe no ROADMAP.md. Nada alterado.');
  process.exit(0);
}

const section = `

---

## ⚠️ REGRA DE OURO — ENCODING UTF-8

> **NUNCA use \`Set-Content\`, \`Out-File\` ou pipe do PowerShell para salvar arquivos .md deste projeto.**
>
> O PowerShell 5.1 lê UTF-8 como Windows-1252 e regrava corrompido.
> Resultado: \`é\` vira \`Ã©\`, \`ção\` vira \`Ã§Ã£o\` etc.

### ✅ SEMPRE use Node.js para manipular arquivos .md:

\`\`\`js
// Ler
fs.readFileSync(filePath, 'utf8')
// Escrever
fs.writeFileSync(filePath, content, 'utf8')
\`\`\`

### Se corrompeu — como recuperar:

\`\`\`bash
# Regenera capítulos limpos (UTF-8 correto)
node scripts/split-chapters.js

# Remove imagens auto-inseridas (para inserção manual)
node scripts/remove-chapter-images.js
\`\`\`

---

## 🖼️ Fluxo — Imagens nos Capítulos (inserção manual)

1. Abra \`content/raw/curso_mergulho_autonomo_basico.md\`
2. Coloque o marcador na linha exata onde a imagem deve aparecer:
   \`\`\`
   [nome_da_imagem.jpg]              ← imagem centralizada
   [float-right:nome_da_imagem.jpg]  ← texto à esquerda, imagem à direita
   \`\`\`
3. Rode: \`node scripts/sync-images-from-raw.js\`
4. Verifique no browser: \`npm run dev\`
5. Commit:
   \`\`\`bash
   git add public/content/chapters/
   git commit -m "feat(content): posiciona imagens"
   git push origin main
   \`\`\`

### Imagens disponíveis em:
\`public/assets/content/curso_mergulho_autonomo_basico/img/\`

---

## 🛠️ Scripts do Projeto

| Script | Comando | Descrição |
|---|---|---|
| Dividir capítulos | \`node scripts/split-chapters.js\` | Lê o raw MD e gera os 9 capítulos |
| Sincronizar imagens | \`node scripts/sync-images-from-raw.js\` | Lê marcadores \`[img.jpg]\` do raw e injeta nos capítulos |
| Remover imagens | \`node scripts/remove-chapter-images.js\` | Remove todas as imagens dos capítulos (reset) |

---

## ⚠️ Regra do Terminal

- **NUNCA** editar arquivos .md pelo PowerShell
- **SEMPRE** abrir com VS Code ou usar Node.js
- PowerShell pode ser usado apenas para: \`git\`, \`npm\`, \`node script.js\`
`;

fs.writeFileSync(fp, existing + section, 'utf8');
console.log('✅ ROADMAP.md atualizado com regras de encoding e fluxo de imagens.');
