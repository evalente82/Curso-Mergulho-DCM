"""
fix-encoding-body.py
─────────────────────────────────────────────────────────
Corrige o mojibake (double UTF-8 encoding) em TODOS os
arquivos .md dentro de public/content/chapters/ e no
public/content/index.json.

Rodado automaticamente pelo GitHub Actions antes do build,
garantindo que edições feitas pelo Sveltia CMS (que às vezes
salva com encoding incorreto) sejam sempre corrigidas antes
de ir para produção.

Uso manual:
  python scripts/fix-encoding-body.py
"""

import glob
import ftfy
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")

# ── Capítulos .md ────────────────────────────────────────
CHAPTERS_DIR = os.path.join(ROOT, "public", "content", "chapters")
files = glob.glob(os.path.join(CHAPTERS_DIR, "*.md"))

# ── index.json ───────────────────────────────────────────
INDEX_FILE = os.path.join(ROOT, "public", "content", "index.json")
if os.path.exists(INDEX_FILE):
    files.append(INDEX_FILE)

if not files:
    print("❌ Nenhum arquivo encontrado.")
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
