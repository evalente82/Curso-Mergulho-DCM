/**
 * remove-chapter-images.js
 * Remove todas as linhas de imagem (![...]) dos arquivos de capítulos.
 * Seguro para UTF-8 — usa Node.js fs (nunca PowerShell).
 */

const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, '..', 'public', 'content', 'chapters');

const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.md'));

let total = 0;
files.forEach(file => {
  const fp = path.join(chaptersDir, file);
  const original = fs.readFileSync(fp, 'utf8');
  const filtered = original
    .split('\n')
    .filter(line => !line.match(/^!\[/))
    .join('\n');

  if (original !== filtered) {
    fs.writeFileSync(fp, filtered, 'utf8');
    const removed = original.split('\n').filter(l => l.match(/^!\[/)).length;
    total += removed;
    console.log(`  ${file}: ${removed} imagem(ns) removida(s)`);
  } else {
    console.log(`  ${file}: sem imagens`);
  }
});

console.log(`\n✅ Total removido: ${total} linha(s) de imagem`);
