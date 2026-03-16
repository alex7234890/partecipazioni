'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WEDDING } from '@/config/wedding'

const GIFT_CREDENTIALS = {
  user: 'guest12778',
  pass: '91800d',
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid rgba(184,150,62,0.12)',
    }}>
      <div>
        <p className="label-elegant mb-1">{label}</p>
        <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#2C2420', letterSpacing: '0.08em' }}>{value}</p>
      </div>
      <button
        onClick={handleCopy}
        style={{
          background: 'transparent',
          border: `1px solid ${copied ? 'rgba(80,160,80,0.5)' : 'rgba(184,150,62,0.35)'}`,
          color: copied ? '#4a9a5a' : '#B8963E',
          fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          padding: '6px 14px', cursor: 'pointer',
          transition: 'all 0.2s', flexShrink: 0,
        }}
      >
        {copied ? 'Copiato' : 'Copia'}
      </button>
    </div>
  )
}

export default function GiftList() {
  return (
    <section className="py-24 px-4">
      <motion.p
        className="label-elegant text-center mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Un pensiero per noi
      </motion.p>
      <motion.h2
        className="font-playfair text-charcoal text-center mb-4"
        style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 400 }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Lista nozze
      </motion.h2>
      <motion.p
        className="font-playfair text-center mb-12"
        style={{ fontSize: '0.88rem', color: 'rgba(44,36,32,0.45)', fontStyle: 'italic', maxWidth: 360, margin: '0 auto 3rem' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Se desiderate farci un regalo, abbiamo preparato una lista con tutto ciò che ci serve per il nostro nido d&apos;amore.
      </motion.p>

      <motion.div
        className="max-w-xs mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <div style={{
          background: '#fff',
          border: '1px solid rgba(184,150,62,0.18)',
          padding: '2rem',
          position: 'relative',
        }}>
          {/* Angolini */}
          <div style={{ position: 'absolute', top: 8, left: 8, width: 14, height: 14, borderTop: '1px solid rgba(184,150,62,0.4)', borderLeft: '1px solid rgba(184,150,62,0.4)' }}/>
          <div style={{ position: 'absolute', bottom: 8, right: 8, width: 14, height: 14, borderBottom: '1px solid rgba(184,150,62,0.4)', borderRight: '1px solid rgba(184,150,62,0.4)' }}/>

          <p className="label-elegant mb-5">Accedi con queste credenziali</p>
          <CopyField label="Utente" value={GIFT_CREDENTIALS.user} />
          <CopyField label="Password" value={GIFT_CREDENTIALS.pass} />

          <a
            href={WEDDING.giftListUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: '1.75rem', width: '100%',
              background: 'transparent',
              border: '1px solid rgba(184,150,62,0.5)',
              color: '#B8963E', textDecoration: 'none',
              fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '13px 0',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#B8963E'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B8963E' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Sfoglia la lista
          </a>
        </div>
        <p style={{ fontSize: '0.68rem', color: 'rgba(44,36,32,0.35)', letterSpacing: '0.06em', textAlign: 'center', marginTop: 12 }}>
          Copia le credenziali prima di aprire il sito
        </p>
      </motion.div>
    </section>
  )
}
