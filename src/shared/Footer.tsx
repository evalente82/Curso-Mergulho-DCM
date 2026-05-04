import { assetUrl } from './basePath'

/**
 * Footer compacto — identidade VCorp Sistem
 * Altura mínima, menos que o menu, apenas uma linha de info.
 */
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ocean-800 bg-ocean-950 text-ocean-400">
      <div className="max-w-5xl mx-auto px-4 h-10 flex items-center justify-between gap-4 text-[11px]">

        {/* Esquerda: copyright + CNPJ */}
        <span className="hidden sm:inline whitespace-nowrap">
          © 2025&nbsp;
          <a href="https://vcorpsistem.com" target="_blank" rel="noopener noreferrer"
             className="text-ocean-300 hover:text-white transition-colors">
            VCorp Sistem
          </a>
          &nbsp;· CNPJ 28.988.813/0001-50
        </span>

        {/* Mobile: só a logo pequena */}
        <img
          src={assetUrl('/icons/vcorpLogo.png')}
          alt="VCorp Sistem"
          className="h-5 object-contain opacity-60 sm:hidden"
        />

        {/* Centro: crédito do curso */}
        <span className="text-ocean-500 whitespace-nowrap hidden sm:inline">
          Defesa Civil Maricá — Curso de Mergulho de Busca e Resgate
        </span>

        {/* Direita: logo pequena */}
        <img
          src={assetUrl('/icons/vcorpLogo.png')}
          alt="VCorp Sistem"
          className="h-5 object-contain opacity-60 hidden sm:block"
        />

      </div>
    </footer>
  )
}
