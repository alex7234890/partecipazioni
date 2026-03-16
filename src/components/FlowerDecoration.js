'use client'

export default function FlowerDecoration({ position = 'top-left', className = '' }) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 scale-x-[-1]',
    'bottom-left': 'bottom-0 left-0 scale-y-[-1]',
    'bottom-right': 'bottom-0 right-0 scale-[-1]',
  }

  return (
    <div
      className={`pointer-events-none absolute ${positionClasses[position]} ${className}`}
      aria-hidden="true"
    >
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rami */}
        <path d="M10 130 Q30 80 80 40" stroke="#C9A84C" strokeWidth="1.5" strokeOpacity="0.5" fill="none" strokeLinecap="round"/>
        <path d="M10 130 Q50 100 100 70" stroke="#C9A84C" strokeWidth="1" strokeOpacity="0.4" fill="none" strokeLinecap="round"/>
        <path d="M10 130 Q20 70 60 30" stroke="#C9A84C" strokeWidth="1" strokeOpacity="0.35" fill="none" strokeLinecap="round"/>

        {/* Foglie */}
        <ellipse cx="55" cy="55" rx="8" ry="14" fill="#C9A84C" fillOpacity="0.25" transform="rotate(-45 55 55)"/>
        <ellipse cx="75" cy="35" rx="6" ry="11" fill="#C9A84C" fillOpacity="0.2" transform="rotate(-60 75 35)"/>
        <ellipse cx="35" cy="75" rx="7" ry="12" fill="#C9A84C" fillOpacity="0.2" transform="rotate(-30 35 75)"/>

        {/* Fiori */}
        <circle cx="80" cy="38" r="5" fill="#D4A5A5" fillOpacity="0.7"/>
        <circle cx="80" cy="28" r="4" fill="#D4A5A5" fillOpacity="0.5"/>
        <circle cx="88" cy="33" r="4" fill="#D4A5A5" fillOpacity="0.5"/>
        <circle cx="72" cy="33" r="4" fill="#D4A5A5" fillOpacity="0.5"/>
        <circle cx="80" cy="38" r="2.5" fill="#C9A84C" fillOpacity="0.8"/>

        <circle cx="45" cy="60" r="4" fill="#D4A5A5" fillOpacity="0.6"/>
        <circle cx="45" cy="52" r="3" fill="#D4A5A5" fillOpacity="0.4"/>
        <circle cx="52" cy="56" r="3" fill="#D4A5A5" fillOpacity="0.4"/>
        <circle cx="38" cy="56" r="3" fill="#D4A5A5" fillOpacity="0.4"/>
        <circle cx="45" cy="60" r="2" fill="#C9A84C" fillOpacity="0.7"/>

        {/* Piccoli puntini decorativi */}
        <circle cx="65" cy="20" r="2" fill="#C9A84C" fillOpacity="0.4"/>
        <circle cx="100" cy="55" r="2" fill="#D4A5A5" fillOpacity="0.5"/>
        <circle cx="25" cy="95" r="2" fill="#C9A84C" fillOpacity="0.3"/>
      </svg>
    </div>
  )
}
