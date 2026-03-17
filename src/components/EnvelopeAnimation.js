'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

function startAmbientPad() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 4)
    master.connect(ctx.destination)
    ;[130.81, 164.81, 196.00, 246.94].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g   = ctx.createGain()
      osc.type            = 'sine'
      osc.frequency.value = freq
      osc.detune.value    = i % 2 ? 4 : -4
      g.gain.value        = 0.28
      osc.connect(g); g.connect(master)
      osc.start(ctx.currentTime + i * 0.20)
    })
    return ctx
  } catch (e) { return null }
}

/* ── Audio globale indipendente dal lifecycle React ─────────────────────
   new Audio() non è legato al DOM del componente: quando l'envelope
   si smonta la musica continua a suonare fino alla chiusura della pagina.
────────────────────────────────────────────────────────────────────── */
function getOrCreateAudio() {
  if (typeof window === 'undefined') return null
  if (!window._weddingAudio) {
    const a = new Audio('/music.mp3')
    a.loop   = true
    a.volume = 0.75
    window._weddingAudio = a
  }
  return window._weddingAudio
}

export default function EnvelopeAnimation({ onOpen }) {
  const [phase, setPhase] = useState('idle')
  const padRef    = useRef(null)
  const playedRef = useRef(false)

  /* Tentativo autoplay al mount — il browser lo concede spesso
     se la pagina è già stata interagita (es. link esterno). */
  useEffect(() => {
    const audio = getOrCreateAudio()
    if (!audio) return
    audio.play().catch(() => { /* bloccato — scatterà al click */ })
  }, [])

  const playMusic = () => {
    if (playedRef.current) return
    playedRef.current = true
    const audio = getOrCreateAudio()
    if (audio) {
      audio.play().catch(() => { padRef.current = startAmbientPad() })
    } else {
      padRef.current = startAmbientPad()
    }
  }

  const handleClick = () => {
    if (phase !== 'idle') return
    playMusic()
    setPhase('opening')
    setTimeout(() => setPhase('done'),  2800)
    setTimeout(() => onOpen?.(),        3300)
  }

  const isOpening = phase === 'opening' || phase === 'done'
  const isDone    = phase === 'done'

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden"
      onClick={handleClick}
      whileTap={{ scale: 0.997 }}
      animate={isDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.65 }}
    >
      {/* Sfondo busta */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#EDE6D9',
        backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />

      {/* ── Luce calda dall'interno ──────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: 'radial-gradient(ellipse 70% 52% at 50% 44%, rgba(255,248,210,0.92) 0%, transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.14, duration: 1.5 }}
      />

      {/* ══════════════════════════════════════════════════════════════
          LEMBO SUPERIORE — fisica 3D con spring
          ─────────────────────────────────────────────────────────────
          • perspective + perspectiveOrigin sul contenitore
          • preserve-3d sul lembo → i figli vivono in 3D
          • spring sottosterzata = overshoot cartaceo realistico
          • il SIGILLO è figlio del lembo: si stacca con lui in 3D,
            backfaceVisibility:hidden = sparisce quando il lembo si rovescia
      ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        perspective: '2800px',
        perspectiveOrigin: '50% 0%',
        zIndex: 6, pointerEvents: 'none',
      }}>
        <motion.div
          style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '50%',
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
          }}
          initial={{ rotateX: 0 }}
          animate={isOpening ? { rotateX: -186 } : { rotateX: 0 }}
          transition={isOpening
            ? {
                delay: 0.16,
                type: 'spring',
                stiffness: 36,   /* lento, come carta pesante */
                damping: 8.5,    /* sottosterzato: overshoot + assestamento */
                mass: 1.8,
              }
            : { duration: 0.35 }
          }
        >
          {/* Fronte del lembo — immagine continua */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
            backgroundSize: 'cover', backgroundPosition: 'center top',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(175deg, transparent 12%, rgba(0,0,0,0.13) 100%)',
            }} />
          </div>

          {/* Retro del lembo — avorio caldo (si vede quando il lembo si apre) */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(175deg, #FEFBF4 0%, #FAF1DC 55%, #F5E9CC 100%)',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}>
            {/* Texture carta lato interno */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255,255,255,0.35) 0%, transparent 70%)',
            }} />
          </div>

          {/* ── SIGILLO incollato al lembo ─────────────────────────────
              bottom:0 + translate(−50%, 50%) = centrato sulla piega
              Con il lembo chiuso appare al centro della busta.
              Ruota INSIEME al lembo in 3D → si stacca in modo naturale.
              backfaceVisibility:hidden → sparisce quando il lembo
              supera i 90° (non si vede mai "al contrario").
          ─────────────────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: '50%',
            transform: 'translate(-50%, 50%)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            zIndex: 2,
          }}>
            <img
              src="/wax-seal.png"
              alt=""
              style={{
                display: 'block',
                width: 140, height: 140,
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Ombra del sigillo — sul corpo della busta, sparisce quando il lembo si apre */}
      <motion.div
        style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%) translateY(55px)',
          width: 122, height: 22,
          borderRadius: '50%',
          background: 'rgba(38,18,4,0.30)',
          filter: 'blur(13px)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
        animate={{ opacity: isOpening ? 0 : 0.85 }}
        transition={{ duration: 0.35 }}
      />

      {/* Hint tocca */}
      <motion.div
        style={{
          position: 'absolute', bottom: '8%', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          zIndex: 10,
        }}
        animate={{ opacity: isOpening ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: '0.68rem', letterSpacing: '0.28em', color: '#7A5E48',
          }}
          animate={{ opacity: [0.28, 0.72, 0.28] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          TOCCA PER APRIRE
        </motion.p>
        <motion.svg width="16" height="10" viewBox="0 0 16 10" fill="none"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M1 1L8 8L15 1" stroke="#7A5E48" strokeOpacity="0.40"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}
