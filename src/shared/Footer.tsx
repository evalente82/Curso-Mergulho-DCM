import { assetUrl } from './basePath'

/**
 * Footer institucional — identidade VCorp Sistem
 * Exibido em todas as páginas do site abaixo do conteúdo principal.
 */
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ocean-800 bg-ocean-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">

        {/* Logo + empresa */}
        <div className="flex flex-col items-center sm:items-start gap-3">
          <img
            src={assetUrl('/icons/vcorpLogo.png')}
            alt="VCorp Sistem"
            className="h-9 object-contain opacity-90"
          />
          <p className="text-xs text-ocean-300 leading-relaxed text-center sm:text-left">
            © 2025 VCorp Sistem. Todos os direitos reservados.<br />
            CNPJ: 28.988.813/0001-50
          </p>
        </div>

        {/* Ícone DCM + crédito */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={assetUrl('/icons/Icone_fundo_Cinza.png')}
            alt="DCM Mergulho"
            className="h-12 object-contain opacity-80"
          />
          <p className="text-xs text-ocean-400 text-center">
            Curso de Mergulho<br />Defesa Civil Maricá
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center sm:items-end gap-2 text-xs">
          <a
            href="https://vcorpsistem.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ocean-300 hover:text-white transition-colors underline underline-offset-2"
          >
            vcorpsistem.com
          </a>
          <span className="text-ocean-500">Desenvolvido por VCorp Sistem</span>
        </div>

      </div>
    </footer>
  )
}
