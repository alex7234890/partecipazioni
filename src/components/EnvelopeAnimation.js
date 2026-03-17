'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

function startAmbientPad() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 5)
    master.connect(ctx.destination)
    ;[130.81, 164.81, 196.00, 246.94].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g   = ctx.createGain()
      osc.type            = 'sine'
      osc.frequency.value = freq
      osc.detune.value    = i % 2 ? 3 : -3
      g.gain.value        = 0.25
      osc.connect(g); g.connect(master)
      osc.start(ctx.currentTime + i * 0.22)
    })
    return ctx
  } catch (e) { return null }
}

export default function EnvelopeAnimation({ onOpen }) {
  const [phase, setPhase] = useState('idle')
  const audioRef = useRef(null)
  const padRef   = useRef(null)

  const handleClick = () => {
    if (phase !== 'idle') return
    setPhase('opening')
    if (audioRef.current) {
      audioRef.current.volume = 0.35
      audioRef.current.play().catch(() => { padRef.current = startAmbientPad() })
    }
    setTimeout(() => setPhase('done'),  2800)
    setTimeout(() => onOpen?.(),        3200)
  }

  const isOpening = phase === 'opening' || phase === 'done'
  const isDone    = phase === 'done'

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden"
      onClick={handleClick}
      whileTap={{ scale: 0.995 }}
      animate={isDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <audio ref={audioRef} src="/music.mp3" loop preload="none" />

      {/* ── Sfondo busta ─────────────────────────────────────────────────
          /public/envelope-bg.png  (priorità) o  /public/envelope-bg.jpg
      ──────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#EDE6D9',
        backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* ── Lembo superiore — apertura fisica con spring ─────────────────
          perspective sul parent + transformStyle preserve-3d sul figlio
          spring stiffness bassa + damping basso = overshoot realistico
          come carta vera che rimbalza quando si apre
      ──────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        perspective: '3200px',
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
          animate={isOpening ? { rotateX: -185 } : { rotateX: 0 }}
          transition={isOpening
            ? {
                delay: 0.18,
                type: 'spring',
                stiffness: 38,   /* molla morbida = movimento lento e fisico */
                damping: 9,      /* sottosterzato = leggero overshoot poi si assesta */
                mass: 1.6,
              }
            : { duration: 0.4 }
          }
        >
          {/* Faccia frontale del lembo: stessa immagine = continuità visiva */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}>
            {/* Ombra verso il punto di piega */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(175deg, transparent 15%, rgba(0,0,0,0.12) 100%)',
            }} />
          </div>

          {/* Faccia interna: carta avorio caldo */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(175deg, #FEFBF4 0%, #FAF2DE 100%)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }} />
        </motion.div>
      </div>

      {/* Luce calda dall'interno quando il lembo si apre */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: 'radial-gradient(ellipse 70% 50% at 50% 44%, rgba(255,248,210,0.90) 0%, transparent 62%)',
        }}
        initial={{ opacity: 0 }}
        animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.15, duration: 1.4 }}
      />

      {/* ── Sigillo cera ─────────────────────────────────────────────────
          File: /public/wax-seal.png
          Animazione: dondola a riposo, vola via al tocco con leggera rotazione
      ──────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
      }}>
        <motion.div
          animate={isOpening
            ? { y: -310, opacity: 0, scale: 0.72, rotate: 8 }
            : { y: [0, -6, 0], scale: [1, 1.018, 1], rotate: 0 }
          }
          transition={isOpening
            ? { duration: 0.70, ease: [0.30, 0, 0.15, 1] }
            : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* Ombra morbida sotto il sigillo */}
          <div style={{
            position: 'absolute', bottom: -16, left: '6%',
            width: '88%', height: 24, borderRadius: '50%',
            background: 'rgba(40,20,5,0.28)',
            filter: 'blur(14px)',
          }} />

          {/* Immagine sigillo */}
          <img
            src="/wax-seal.png"
            alt=""
            style={{
              display: 'block',
              width: 140, height: 140,
              objectFit: 'cover',
              borderRadius: '50%',
              position: 'relative',
            }}
          />
        </motion.div>
      </div>

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
          animate={{ opacity: [0.30, 0.75, 0.30] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          TOCCA PER APRIRE
        </motion.p>
        <motion.svg width="16" height="10" viewBox="0 0 16 10" fill="none"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M1 1L8 8L15 1" stroke="#7A5E48" strokeOpacity="0.42"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}
