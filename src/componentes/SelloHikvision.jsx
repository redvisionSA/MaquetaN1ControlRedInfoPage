/**
 * Sello «Hik Tech Ambassador oficial» con el wordmark de Hikvision que usa la
 * web v1 (variantes clara y oscura que conmuta el CSS .tsw-light/.tsw-dark).
 * Va en la ficha de los productos Hikvision: es la marca de referencia de
 * Control Red.
 */
export default function SelloHikvision({ className = '' }) {
  return (
    <div
      className={`cr-solido inline-flex h-10 items-center gap-2.5 !rounded-full px-3 ${className}`}
      title="Control Red es Hik Tech Ambassador oficial de Hikvision"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-cr-red" aria-hidden="true">
        <path d="M12 3 4.5 6v5.5c0 4.4 3.1 8 7.5 9.5 4.4-1.5 7.5-5.1 7.5-9.5V6Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <img className="tsw-light h-[14px] w-auto" src="/img/hikvision-claro.webp" alt="Hikvision" width="110" height="14" />
      <img className="tsw-dark h-[14px] w-auto" src="/img/hikvision-oscuro.webp" alt="Hikvision" width="110" height="14" />
      <span className="whitespace-nowrap text-[11px] font-semibold text-black/75 dark:text-white/80">Hik Tech Ambassador oficial</span>
    </div>
  )
}
