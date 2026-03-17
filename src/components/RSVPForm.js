'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import PetalRain from './PetalRain'

const STATUS_OPTIONS = [
  { value: 'yes',   label: 'Parteciperò con gioia' },
  { value: 'maybe', label: 'Forse, vi farò sapere'  },
  { value: 'no',    label: 'Purtroppo non potrò'    },
]

export default function RSVPForm({ guest }) {
  const [status, setStatus]       = useState(guest?.rsvp_status !== 'pending' ? guest?.rsvp_status : null)
  const [allergies, setAllergies] = useState(guest?.allergies || '')
  const [message, setMessage]     = useState(guest?.message   || '')
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState(null)
  const [showPetals, setShowPetals] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!status) { setError('Seleziona la tua presenza'); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('guests')
      .update({ rsvp_status: status, allergies: allergies || null, message: message || null, responded_at: new Date().toISOString() })
      .eq('slug', guest.slug)
    setLoading(false)
    if (dbError) { setError('Errore nel salvataggio. Riprova o contattaci.'); return }
    setSubmitted(true)
    setShowPetals(true)
    setTimeout(() => setShowPetals(false), 6000)
  }

  return (
    <section className="py-24 px-4">
      <PetalRain active={showPetals} count={50} />

      <motion.p
        className="label-elegant text-center mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Fateci sapere
      </motion.p>
      <motion.h2
        className="font-playfair text-charcoal text-center mb-16"
        style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 400 }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Conferma la presenza
      </motion.h2>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            className="max-w-sm mx-auto text-center py-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Piccolo ornamento */}
            <div className="flex justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 2 L19 11 L28 11 L21 17 L24 26 L16 20 L8 26 L11 17 L4 11 L13 11 Z"
                  fill="#2E5230" fillOpacity="0.35"/>
              </svg>
            </div>
            <h3 className="font-playfair text-charcoal mb-4" style={{ fontSize: '1.5rem', fontWeight: 400 }}>
              Grazie, {guest?.name?.split(' ')[0]}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(44,36,32,0.5)', lineHeight: 1.8, fontStyle: 'italic' }}>
              Non vediamo l&apos;ora di festeggiare con voi<br/>il giorno più bello della nostra vita.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="max-w-sm mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Nome ospite */}
            <div className="mb-8">
              <p className="label-elegant mb-3">Ospite</p>
              <p className="font-playfair text-charcoal" style={{ fontSize: '1.05rem', fontWeight: 400 }}>
                {guest?.name || '—'}
              </p>
              <div style={{ height: 1, background: 'rgba(46,82,48,0.20)', marginTop: 8 }}/>
            </div>

            {/* Presenza */}
            <div className="mb-8">
              <p className="label-elegant mb-4">Sarò presente</p>
              <div className="flex flex-col gap-0">
                {STATUS_OPTIONS.map((opt, i) => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 0',
                      borderBottom: i < STATUS_OPTIONS.length - 1 ? '1px solid rgba(46,82,48,0.12)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Radio elegante */}
                    <div
                      onClick={() => setStatus(opt.value)}
                      style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        border: `1px solid ${status === opt.value ? '#2E5230' : 'rgba(44,36,32,0.2)'}`,
                        background: '#FAF7F2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      {status === opt.value && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E5230' }}/>
                      )}
                    </div>
                    <span
                      onClick={() => setStatus(opt.value)}
                      style={{
                        fontSize: '0.88rem',
                        color: status === opt.value ? '#2C2420' : 'rgba(44,36,32,0.45)',
                        fontWeight: status === opt.value ? 400 : 300,
                        letterSpacing: '0.02em',
                        transition: 'color 0.2s',
                      }}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergie */}
            <div className="mb-6">
              <p className="label-elegant mb-3">Allergie o intolleranze</p>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                rows={2}
                placeholder="es. glutine, latticini, frutta secca…"
                style={{
                  width: '100%', resize: 'none', outline: 'none',
                  background: 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(46,82,48,0.20)',
                  padding: '8px 0', fontSize: '0.85rem',
                  color: '#2C2420', fontWeight: 300, letterSpacing: '0.02em',
                  fontFamily: "'Lato', sans-serif",
                }}
              />
            </div>

            {/* Messaggio */}
            <div className="mb-10">
              <p className="label-elegant mb-3">
                Un pensiero per gli sposi
                <span style={{ marginLeft: 8, textTransform: 'none', letterSpacing: 0, color: 'rgba(44,36,32,0.35)', fontSize: '0.65rem' }}>(facoltativo)</span>
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Scrivi qualcosa di speciale…"
                style={{
                  width: '100%', resize: 'none', outline: 'none',
                  background: 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(46,82,48,0.20)',
                  padding: '8px 0', fontSize: '0.85rem',
                  color: '#2C2420', fontWeight: 300, letterSpacing: '0.02em',
                  fontFamily: "'Lato', sans-serif",
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '0.78rem', color: '#c0392b', textAlign: 'center', marginBottom: '1rem', letterSpacing: '0.03em' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid rgba(46,82,48,0.50)',
                color: '#2E5230',
                fontFamily: "'Lato', sans-serif",
                fontSize: '0.72rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                padding: '14px 0',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background 0.25s, color 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2E5230'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2E5230' }}
            >
              {loading ? 'Invio in corso…' : 'Invia conferma'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  )
}
