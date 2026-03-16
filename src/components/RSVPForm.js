'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import PetalRain from './PetalRain'

const STATUS_OPTIONS = [
  { value: 'yes', label: 'Ci sarò! 🎉', color: 'bg-green-50 border-green-400 text-green-700' },
  { value: 'maybe', label: 'Forse 🤔', color: 'bg-amber-50 border-amber-400 text-amber-700' },
  { value: 'no', label: 'Non posso 😢', color: 'bg-red-50 border-red-400 text-red-700' },
]

export default function RSVPForm({ guest }) {
  const [status, setStatus] = useState(guest?.rsvp_status !== 'pending' ? guest?.rsvp_status : null)
  const [allergies, setAllergies] = useState(guest?.allergies || '')
  const [message, setMessage] = useState(guest?.message || '')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [showPetals, setShowPetals] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!status) {
      setError('Seleziona la tua presenza')
      return
    }
    setLoading(true)
    setError(null)

    const { error: dbError } = await supabase
      .from('guests')
      .update({
        rsvp_status: status,
        allergies: allergies || null,
        message: message || null,
        responded_at: new Date().toISOString(),
      })
      .eq('slug', guest.slug)

    setLoading(false)

    if (dbError) {
      setError('Errore nel salvataggio. Riprova o contattaci.')
      return
    }

    setSubmitted(true)
    setShowPetals(true)
    setTimeout(() => setShowPetals(false), 6000)
  }

  return (
    <section className="py-16 px-4">
      <PetalRain active={showPetals} count={50} />

      <motion.h2
        className="font-playfair text-3xl sm:text-4xl text-gold text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Conferma la presenza
      </motion.h2>
      <motion.p
        className="text-center text-rose/60 mb-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Ci farebbe molto piacere averti con noi
      </motion.p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            className="max-w-md mx-auto text-center py-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="text-5xl mb-4">🌸</div>
            <h3 className="font-playfair text-2xl text-gold mb-3">
              Grazie, {guest?.name?.split(' ')[0]}!
            </h3>
            <p className="text-charcoal/70 leading-relaxed">
              Non vediamo l&apos;ora di festeggiare con te il giorno più bello della nostra vita.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-white rounded-2xl border border-gold/20 shadow-sm p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Nome ospite */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal/70 mb-2 tracking-wide uppercase">
                Ospite
              </label>
              <div className="w-full bg-cream border border-gold/20 rounded-lg px-4 py-3 text-charcoal/80 font-playfair">
                {guest?.name || '—'}
              </div>
            </div>

            {/* Presenza */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal/70 mb-3 tracking-wide uppercase">
                Sarò presente? *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`w-full border-2 rounded-xl py-3 px-4 text-center font-medium transition-all duration-200 ${
                      status === opt.value
                        ? opt.color + ' scale-[1.02] shadow-sm'
                        : 'border-gray-200 text-gray-500 hover:border-gold/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergie */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-charcoal/70 mb-2 tracking-wide uppercase">
                Allergie o intolleranze alimentari
              </label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                rows={2}
                placeholder="es. noci, glutine, lattosio…"
                className="w-full border border-gold/20 rounded-lg px-4 py-3 text-charcoal/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 bg-cream/50"
              />
            </div>

            {/* Messaggio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal/70 mb-2 tracking-wide uppercase">
                Un messaggio per gli sposi
                <span className="ml-1 text-charcoal/40 normal-case">(facoltativo)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Scrivi qualcosa di speciale…"
                className="w-full border border-gold/20 rounded-lg px-4 py-3 text-charcoal/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 bg-cream/50"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-white font-playfair text-lg py-3.5 rounded-full hover:bg-gold/90 transition-colors shadow-md disabled:opacity-60"
            >
              {loading ? 'Invio in corso…' : 'Invia conferma ✨'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  )
}
