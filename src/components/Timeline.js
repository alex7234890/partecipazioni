'use client'

import { motion } from 'framer-motion'
import { WEDDING } from '@/config/wedding'

// Icone SVG eleganti per ogni momento
const ICONS = {
  '🕓': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
    </svg>
  ),
  '💍': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 6l4-4 4 4"/><ellipse cx="12" cy="14" rx="7" ry="5"/>
    </svg>
  ),
  '🥂': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 22V12L4 4h16l-4 8v10"/><path d="M8 22h8"/><path d="M8 12h8"/>
    </svg>
  ),
  '🍽️': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 2v7c0 2.8 2.2 5 5 5s5-2.2 5-5V2"/><path d="M8 2v20"/><path d="M21 2v20"/><path d="M17 2c0 4 4 6 4 6"/>
    </svg>
  ),
  '🎂': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 1.5 1 2 1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/>
    </svg>
  ),
  '🍸': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 22h8"/><path d="M12 11v11"/><path d="M3 3l9 8 9-8H3z"/>
    </svg>
  ),
}

export default function Timeline() {
  return (
    <section className="py-24 px-4">
      <motion.p
        className="label-elegant text-center mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Il programma
      </motion.p>
      <motion.h2
        className="font-playfair text-charcoal text-center mb-16"
        style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 400 }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        La nostra giornata
      </motion.h2>

      <div className="relative max-w-md mx-auto">
        {/* Linea verticale centrale */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0, bottom: 0,
          width: 1,
          background: 'linear-gradient(to bottom, transparent, rgba(139,150,64,0.25) 10%, rgba(139,150,64,0.25) 90%, transparent)',
          transform: 'translateX(-50%)',
        }}/>

        {WEDDING.timeline.map((item, i) => {
          const isLeft = i % 2 === 0
          return (
            <motion.div
              key={i}
              className="relative flex items-center mb-10"
              initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Lato sinistro */}
              <div className="flex-1 flex justify-end pr-6" style={{ visibility: isLeft ? 'visible' : 'hidden' }}>
                <TimelineCard item={item} align="right" />
              </div>

              {/* Nodo centrale */}
              <div style={{
                position: 'relative', zIndex: 2,
                width: 32, height: 32, flexShrink: 0,
                borderRadius: '50%',
                background: '#FAF7F2',
                border: '1px solid rgba(139,150,64,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#8B9640',
              }}>
                {ICONS[item.icon] ?? (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B9640', opacity: 0.6 }}/>
                )}
              </div>

              {/* Lato destro */}
              <div className="flex-1 pl-6" style={{ visibility: isLeft ? 'hidden' : 'visible' }}>
                <TimelineCard item={item} align="left" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function TimelineCard({ item, align }) {
  return (
    <div style={{ textAlign: align === 'right' ? 'right' : 'left' }}>
      <p className="font-playfair text-gold" style={{ fontSize: '1.15rem', fontWeight: 400, lineHeight: 1 }}>
        {item.time}
      </p>
      <p style={{ fontSize: '0.82rem', color: 'rgba(44,36,32,0.55)', marginTop: 3, fontWeight: 300, letterSpacing: '0.03em' }}>
        {item.label}
      </p>
    </div>
  )
}
