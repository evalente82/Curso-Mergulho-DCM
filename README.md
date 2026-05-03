# Curso Mergulho DCM

Notas rápidas:

- Conteúdo extraído de PDFs está em `content/raw` e imagens em `public/assets/content/<slug>/img`.
- O bundle portátil do Poppler foi usado localmente para a extração; ele foi removido do repositório. Para rebaixar:

  1. Visite https://github.com/oschwartz10612/poppler-windows/releases
  2. Baixe o asset `Release-<version>.zip`, extraia e use `pdftotext.exe` e `pdfimages.exe` como mostrado em `scripts/`.

Comandos para gerar índice de conteúdo:

```powershell
node scripts/build-content.js
```
