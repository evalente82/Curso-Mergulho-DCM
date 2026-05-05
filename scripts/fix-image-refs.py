"""
fix-image-refs.py
─────────────────────────────────────────────────────────────────
Converte referências de imagem no formato de anotação de PDF:
    [nome-da-imagem.png]
para Markdown válido:
    ![](/assets/content/curso_mergulho_autonomo_basico/img/nome-da-imagem.png)

Rodado uma única vez para limpar os capítulos.
Após isso, o CMS (Sveltia) insere imagens sempre no formato correto.

Uso:
  python scripts/fix-image-refs.py
"""

import glob
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
CHAPTERS_DIR = os.path.join(ROOT, "public", "content", "chapters")
IMG_BASE = "/assets/content/curso_mergulho_autonomo_basico/img"

# Padrão: linha que começa com [nome.ext] onde ext é imagem
IMG_LINE_RE = re.compile(r'^\[([^\]]+\.(png|jpg|jpeg|gif|webp|svg))\]\s*$', re.IGNORECASE)

files = glob.glob(os.path.join(CHAPTERS_DIR, "*.md"))
total_fixed = 0

for filepath in sorted(files):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    file_changed = 0

    for line in lines:
        m = IMG_LINE_RE.match(line)
        if m:
            img_name = m.group(1)
            new_line = f"![{img_name}]({IMG_BASE}/{img_name})\n"
            new_lines.append(new_line)
            file_changed += 1
        else:
            new_lines.append(line)

    if file_changed:
        with open(filepath, "w", encoding="utf-8", newline="\n") as f:
            f.writelines(new_lines)
        print(f"✅ {os.path.basename(filepath)}: {file_changed} imagem(ns) corrigida(s)")
        total_fixed += file_changed
    else:
        print(f"  ok: {os.path.basename(filepath)}")

print(f"\n✨ Total: {total_fixed} referência(s) de imagem convertida(s) para Markdown válido.")
