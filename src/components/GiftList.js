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
    <div className="flex items-center justify-between gap-3 bg-cream rounded-xl px-4 py-3 border border-gold/20">
      <div className="text-left">
        <p className="text-xs text-charcoal/40 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-mono text-charcoal font-semibold tracking-wider">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
          copied
            ? 'bg-green-500 text-white'
            : 'bg-white border border-gold/30 text-gold hover:bg-gold hover:text-white'
        }`}
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
            Copiato!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Copia
          </>
        )}
      </button>
    </div>
  )
}

export default function GiftList() {
  return (
    <section className="py-16 px-4">
      <motion.h2
        className="font-playfair text-3xl sm:text-4xl text-gold text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Lista nozze
      </motion.h2>
      <motion.p
        className="text-rose/60 mb-10 max-w-md mx-auto leading-relaxed text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Se desiderate farci un regalo, abbiamo preparato una lista con tutto ciò che ci serve per il nostro nido d&apos;amore.
      </motion.p>

      <motion.div
        className="max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        {/* Card credenziali */}
        <div className="bg-white border border-gold/20 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-gold/10 to-rose/10 px-5 py-4 border-b border-gold/10">
            <p className="font-playfair text-gold text-base">🎁 Accedi alla lista regali</p>
            <p className="text-xs text-charcoal/50 mt-0.5">Usa queste credenziali sul sito</p>
          </div>

          <div className="px-5 py-4 space-y-3">
            <CopyField label="Utente" value={GIFT_CREDENTIALS.user} />
            <CopyField label="Password" value={GIFT_CREDENTIALS.pass} />
          </div>

          <div className="px-5 pb-5">
            <a
              href={WEDDING.giftListUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gold text-white font-playfair py-3 rounded-xl hover:bg-gold/90 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              Apri il sito
            </a>
          </div>
        </div>

        <p className="text-xs text-center text-charcoal/40">
          Copia le credenziali prima di aprire il sito
        </p>
      </motion.div>
    </section>
  )
}
