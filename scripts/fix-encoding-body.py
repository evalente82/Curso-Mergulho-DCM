"""
fix-encoding-body.py
─────────────────────────────────────────────────────────
Corrige o mojibake (double UTF-8 encoding) em TODOS os
arquivos .md dentro de public/content/chapters/.

O problema:
  - Arquivos originais eram Latin-1/Windows-1252
  - Foram convertidos incorretamente para UTF-8 duas vezes
  - Resultado: "São" aparece como "SÃÂ£o"

A solução (ftfy):
  - ftfy detecta automaticamente o tipo de corrupção
  - Corrige sem precisar saber exatamente quantas camadas

Uso:
  python scripts/fix-encoding-body.py
"""

import glob
import ftfy
import os

CHAPTERS_DIR = os.path.join(
    os.path.dirname(__file__), "..", "public", "content", "chapters"
)

files = glob.glob(os.path.join(CHAPTERS_DIR, "*.md"))

if not files:
    print("❌ Nenhum arquivo .md encontrado em:", CHAPTERS_DIR)
    exit(1)

fixed_count = 0
for filepath in sorted(files):
    with open(filepath, "r", encoding="utf-8") as f:
        original = f.read()

    fixed = ftfy.fix_text(original)

    if fixed != original:
        with open(filepath, "w", encoding="utf-8", newline="\n") as f:
            f.write(fixed)
        print(f"✅ Corrigido: {os.path.basename(filepath)}")
        fixed_count += 1
    else:
        print(f"  ok: {os.path.basename(filepath)}")

print(f"\n✨ {fixed_count} arquivo(s) corrigido(s) de {len(files)} total.")
