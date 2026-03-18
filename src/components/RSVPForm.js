'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import PetalRain from './PetalRain'

// ── Riga per singolo componente del nucleo ─────────────────────────────
function MemberRow({ member, onStatus, onAllergies }) {
  const isYes = member.rsvp_status === 'yes'
  const isNo  = member.rsvp_status === 'no'

  return (
    <div style={{ paddingBottom: '1.4rem', borderBottom: '1px solid rgba(139,150,64,0.10)' }}>
      {/* Nome + badge bimbo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: '0.95rem', color: '#2C2420', fontWeight: 400, fontFamily: "'Lato', sans-serif" }}>
          {member.name}
        </span>
        {member.is_child && (
          <span style={{
            fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#7A5E48', border: '1px solid rgba(122,94,72,0.30)',
            padding: '2px 7px', borderRadius: 20,
          }}>
            bimbo/a
          </span>
        )}
      </div>

      {/* Pulsanti presenza */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => onStatus(member.id, isYes ? null : 'yes')}
          style={{
            flex: 1, padding: '9px 0',
            fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
            border: `1px solid ${isYes ? '#8B9640' : 'rgba(44,36,32,0.14)'}`,
            background: isYes ? 'rgba(139,150,64,0.09)' : 'transparent',
            color: isYes ? '#8B9640' : 'rgba(44,36,32,0.38)',
            borderRadius: 4, cursor: 'pointer', transition: 'all 0.18s',
            fontFamily: "'Lato', sans-serif",
          }}
        >
          ✓ &nbsp;Parteciperò
        </button>
        <button
          type="button"
          onClick={() => onStatus(member.id, isNo ? null : 'no')}
          style={{
            flex: 1, padding: '9px 0',
            fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
            border: `1px solid ${isNo ? 'rgba(192,57,43,0.55)' : 'rgba(44,36,32,0.14)'}`,
            background: isNo ? 'rgba(192,57,43,0.06)' : 'transparent',
            color: isNo ? '#c0392b' : 'rgba(44,36,32,0.38)',
            borderRadius: 4, cursor: 'pointer', transition: 'all 0.18s',
            fontFamily: "'Lato', sans-serif",
          }}
        >
          ✗ &nbsp;Non vengo
        </button>
      </div>

      {/* Campo allergie — visibile solo se parteciperà */}
      <AnimatePresence>
        {isYes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <textarea
              value={member.allergies}
              onChange={(e) => onAllergies(member.id, e.target.value)}
              rows={1}
              placeholder="Allergie o intolleranze (opzionale)"
              style={{
                width: '100%', resize: 'none', outline: 'none',
                background: 'transparent',
                border: 'none', borderBottom: '1px solid rgba(139,150,64,0.15)',
                padding: '6px 0', fontSize: '0.80rem',
                color: '#2C2420', fontWeight: 300, letterSpacing: '0.02em',
                fontFamily: "'Lato', sans-serif",
                marginTop: 4,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Form principale ───────────────────────────────────────────────────
export default function RSVPForm({ guest, members: initialMembers = [] }) {
  const [memberData, setMemberData] = useState(() =>
    initialMembers.map(m => ({
      id: m.id,
      name: m.name,
      is_child: m.is_child,
      rsvp_status: m.rsvp_status !== 'pending' ? m.rsvp_status : null,
      allergies: m.allergies || '',
    }))
  )
  const [message, setMessage]       = useState(guest?.message || '')
  const [loading, setLoading]       = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState(null)
  const [showPetals, setShowPetals] = useState(false)

  const setMemberStatus = (id, status) =>
    setMemberData(prev => prev.map(m => m.id === id ? { ...m, rsvp_status: status } : m))

  const setMemberAllergies = (id, allergies) =>
    setMemberData(prev => prev.map(m => m.id === id ? { ...m, allergies } : m))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (memberData.length > 0 && memberData.some(m => m.rsvp_status === null)) {
      setError('Indica la presenza per ogni componente del nucleo')
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (memberData.length > 0) {
      // Aggiorna ogni membro singolarmente
      for (const m of memberData) {
        const { error: mErr } = await supabase
          .from('guest_members')
          .update({ rsvp_status: m.rsvp_status, allergies: m.allergies || null })
          .eq('id', m.id)
        if (mErr) {
          setLoading(false)
          setError('Errore nel salvataggio. Riprova o contattaci.')
          return
        }
      }

      // Calcola lo stato globale dell'invito
      const statuses = memberData.map(m => m.rsvp_status)
      const overall = statuses.every(s => s === 'yes') ? 'yes'
        : statuses.every(s => s === 'no') ? 'no'
        : 'maybe'

      await supabase.from('guests').update({
        rsvp_status: overall,
        message: message || null,
        responded_at: new Date().toISOString(),
      }).eq('slug', guest.slug)
    } else {
      // Fallback: invito vecchio senza membri — aggiorna direttamente il guest
      // (non dovrebbe accadere dopo la migrazione DB)
      const { error: dbError } = await supabase
        .from('guests')
        .update({ message: message || null, responded_at: new Date().toISOString() })
        .eq('slug', guest.slug)
      if (dbError) { setLoading(false); setError('Errore nel salvataggio.'); return }
    }

    setLoading(false)
    setSubmitted(true)
    setShowPetals(true)
    setTimeout(() => setShowPetals(false), 6000)
  }

  // Messaggio di ringraziamento
  if (submitted) {
    return (
      <section className="py-24 px-4">
        <PetalRain active={showPetals} count={50} />
        <motion.div
          className="max-w-sm mx-auto text-center py-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2 L19 11 L28 11 L21 17 L24 26 L16 20 L8 26 L11 17 L4 11 L13 11 Z"
                fill="#8B9640" fillOpacity="0.35"/>
            </svg>
          </div>
          <h3 className="font-playfair text-charcoal mb-4" style={{ fontSize: '1.5rem', fontWeight: 400 }}>
            Grazie, {guest?.name?.split(' ')[0]}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'rgba(44,36,32,0.5)', lineHeight: 1.8, fontStyle: 'italic' }}>
            Non vediamo l&apos;ora di festeggiare con voi<br/>il giorno più bello della nostra vita.
          </p>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="py-24 px-4">
      <PetalRain active={showPetals} count={50} />

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

      <motion.p
        className="font-playfair text-center"
        style={{ fontSize: 'clamp(1.0rem, 3vw, 1.3rem)', color: 'rgba(44,36,32,0.52)', marginBottom: '2.5rem' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Vi chiediamo gentilmente di comunicarci<br/>la vostra presenza entro il 30 aprile
      </motion.p>

      <motion.form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Nome gruppo */}
        <div className="mb-8">
          <p className="label-elegant mb-3">Invitato</p>
          <p className="font-playfair text-charcoal" style={{ fontSize: '1.05rem', fontWeight: 400 }}>
            {guest?.name || '—'}
          </p>
          <div style={{ height: 1, background: 'rgba(139,150,64,0.20)', marginTop: 8 }}/>
        </div>

        {/* Lista componenti con presenza individuale */}
        {memberData.length > 0 ? (
          <div className="mb-8">
            <p className="label-elegant mb-5">Chi parteciperà</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {memberData.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  onStatus={setMemberStatus}
                  onAllergies={setMemberAllergies}
                />
              ))}
            </div>
          </div>
        ) : (
          // Fallback: nessun membro (invito vecchio non migrato)
          <div className="mb-8">
            <p style={{ fontSize: '0.82rem', color: 'rgba(44,36,32,0.45)', fontStyle: 'italic' }}>
              Configura i componenti dell&apos;invito tramite la dashboard.
            </p>
          </div>
        )}

        {/* Messaggio agli sposi */}
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
              border: 'none', borderBottom: '1px solid rgba(139,150,64,0.20)',
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
            border: '1px solid rgba(139,150,64,0.50)',
            color: '#8B9640',
            fontFamily: "'Lato', sans-serif",
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            padding: '14px 0',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'background 0.25s, color 0.25s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#8B9640'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8B9640' }}
        >
          {loading ? 'Invio in corso…' : 'Invia conferma'}
        </button>
      </motion.form>
    </section>
  )
}
