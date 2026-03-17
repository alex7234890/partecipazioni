'use client'

import { motion } from 'framer-motion'
import { WEDDING } from '@/config/wedding'

function LocationItem({ location, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: '#fff',
        border: '1px solid rgba(46,82,48,0.18)',
        padding: '2rem',
        position: 'relative',
      }}
    >
      {/* Angolino decorativo */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        width: 16, height: 16,
        borderTop: '1px solid rgba(46,82,48,0.40)',
        borderLeft: '1px solid rgba(46,82,48,0.40)',
      }}/>
      <div style={{
        position: 'absolute', bottom: 10, right: 10,
        width: 16, height: 16,
        borderBottom: '1px solid rgba(46,82,48,0.40)',
        borderRight: '1px solid rgba(46,82,48,0.40)',
      }}/>

      <p className="label-elegant mb-3">{label}</p>
      <h3 className="font-playfair text-charcoal mb-1" style={{ fontSize: '1.15rem', fontWeight: 400 }}>
        {location.name}
      </h3>
      <p style={{ fontSize: '0.78rem', color: 'rgba(44,36,32,0.45)', letterSpacing: '0.03em', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        {location.address}
      </p>
      <a
        href={location.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#2E5230', textDecoration: 'none',
          borderBottom: '1px solid rgba(46,82,48,0.35)',
          paddingBottom: 2,
          transition: 'opacity 0.2s',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        Indicazioni stradali
      </a>
    </motion.div>
  )
}

export default function LocationCard() {
  return (
    <section className="py-24 px-4">
      <motion.p
        className="label-elegant text-center mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Vi aspettiamo
      </motion.p>
      <motion.h2
        className="font-playfair text-charcoal text-center mb-16"
        style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 400 }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Le location
      </motion.h2>

      <div className="max-w-2xl mx-auto grid gap-6 sm:grid-cols-2">
        <LocationItem location={WEDDING.ceremonyLocation} label="Cerimonia"   delay={0.1} />
        <LocationItem location={WEDDING.receptionLocation} label="Ricevimento" delay={0.2} />
      </div>
    </section>
  )
}
