'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

// Soft ambient pad (Cmaj7) via Web Audio API — fallback when no mp3
function startAmbientPad() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 5)
    master.connect(ctx.destination)

    // C3 E3 G3 B3 — Cmaj7 sustained chord
    ;[130.81, 164.81, 196.00, 246.94].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g   = ctx.createGain()
      osc.type          = 'sine'
      osc.frequency.value = freq
      osc.detune.value  = i % 2 ? 3 : -3   // subtle chorus
      g.gain.value      = 0.25
      osc.connect(g)
      g.connect(master)
      osc.start(ctx.currentTime + i * 0.22)
    })
    return ctx
  } catch (e) {
    return null
  }
}

export default function EnvelopeAnimation({ onOpen }) {
  const [phase, setPhase] = useState('idle') // idle | opening | done
  const audioRef = useRef(null)
  const padRef   = useRef(null)

  const handleClick = () => {
    if (phase !== 'idle') return
    setPhase('opening')

    // Try mp3 first; fall back to Web Audio pad
    if (audioRef.current) {
      audioRef.current.volume = 0.35
      audioRef.current.play().catch(() => {
        padRef.current = startAmbientPad()
      })
    }

    // Fade envelope out → notify parent
    setTimeout(() => setPhase('done'),  2350)
    setTimeout(() => onOpen?.(),        2850)
  }

  const isOpening = phase === 'opening' || phase === 'done'
  const isDone    = phase === 'done'

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden"
      style={{ background: '#F2ECE3' }}
      onClick={handleClick}
      animate={isDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.55 }}
    >
      {/* Optional mp3 music */}
      <audio ref={audioRef} src="/music.mp3" loop preload="none" />

      {/* Subtle vignette around edges */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 130% 130% at 50% 50%, transparent 42%, rgba(110,72,28,0.09) 100%)',
      }} />

      {/* ── Static envelope flaps: bottom / left / right ── */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Bottom flap — darkest (shadow) */}
        <polygon points="0,100 100,100 50,50" fill="#CEC5B8" />
        {/* Left flap */}
        <polygon points="0,0 0,100 50,50"    fill="#D9D1C5" />
        {/* Right flap */}
        <polygon points="100,0 100,100 50,50" fill="#DDD5C9" />
        {/* Fold crease lines */}
        <line x1="0"   y1="0"   x2="50" y2="50" stroke="rgba(65,40,12,0.09)" strokeWidth="0.3" />
        <line x1="100" y1="0"   x2="50" y2="50" stroke="rgba(65,40,12,0.09)" strokeWidth="0.3" />
        <line x1="0"   y1="100" x2="50" y2="50" stroke="rgba(65,40,12,0.09)" strokeWidth="0.3" />
        <line x1="100" y1="100" x2="50" y2="50" stroke="rgba(65,40,12,0.09)" strokeWidth="0.3" />
        {/* Outer border */}
        <rect x="1.5" y="1.5" width="97" height="97"
          fill="none" stroke="rgba(105,70,25,0.12)" strokeWidth="0.55" />
      </svg>

      {/* ── Top flap — opens in CSS 3D ── */}
      <div style={{
        position: 'absolute', inset: 0,
        perspective: '3500px',
        perspectiveOrigin: '50% 0%',
        zIndex: 6,
        pointerEvents: 'none',
      }}>
        <motion.div
          style={{
            position: 'absolute',
            left: 0, right: 0, top: 0,
            height: '50%',
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
          }}
          animate={isOpening ? { rotateX: -172 } : { rotateX: 0 }}
          transition={{ delay: 0.28, duration: 1.45, ease: [0.38, 0, 0.1, 1] }}
        >
          {/* Front face of flap */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(175deg, #E6DFD3 0%, #D9D1C2 100%)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }} />
          {/* Back face (inner lining — warm ivory) */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(175deg, #FFFBF4 0%, #FFF5E9 100%)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }} />
        </motion.div>
      </div>

      {/* ── Inner warm glow — appears as flap opens ── */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(ellipse 80% 60% at 50% 42%, rgba(255,248,220,0.93) 0%, transparent 65%)',
        }}
        initial={{ opacity: 0 }}
        animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.2, duration: 1.25 }}
      />

      {/* ── Wax seal with monogram ── */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
      }}>
        <motion.div
          animate={isOpening
            ? { y: -270, opacity: 0, scale: 0.8 }
            : { y: 0,    opacity: 1, scale: 1  }}
          transition={{ duration: 0.85, ease: [0.35, 0, 0.18, 1] }}
        >
          {/* Dropshadow blob */}
          <div style={{
            position: 'absolute', bottom: -12, left: '8%',
            width: '84%', height: 20, borderRadius: '50%',
            background: 'rgba(60,35,8,0.22)',
            filter: 'blur(10px)',
          }} />

          {/* Seal circle */}
          <div style={{
            position: 'relative',
            width: 132, height: 132,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 33% 27%, #EDE0B8, #C29558 50%, #8A6020)',
            boxShadow: [
              '0 6px 32px rgba(0,0,0,0.24)',
              '0 2px 6px rgba(0,0,0,0.12)',
              'inset 0 2px 6px rgba(255,240,180,0.42)',
              'inset 0 -3px 8px rgba(0,0,0,0.26)',
            ].join(', '),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {/* monogram.png = "logo partecipazioni.jpeg" */}
            <img
              src="/monogram.png"
              alt=""
              style={{
                width: '80%', height: '80%',
                objectFit: 'contain',
                mixBlendMode: 'multiply',
                opacity: 0.88,
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Cursive text under seal ── */}
      <div style={{
        position: 'absolute', left: '50%', top: '66%',
        transform: 'translateX(-50%)',
        zIndex: 10, textAlign: 'center',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isOpening ? { opacity: 0, y: -6 } : { opacity: 0.68, y: 0 }}
          transition={{ duration: 0.35, delay: isOpening ? 0 : 0.85 }}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.05rem, 3.5vw, 1.38rem)',
            color: '#5A4130',
            fontStyle: 'italic',
            whiteSpace: 'nowrap',
          }}
        >
          Questo invito è solo per te
        </motion.p>
      </div>

      {/* ── Tap hint ── */}
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
            fontSize: '0.68rem',
            letterSpacing: '0.28em',
            color: '#7A5E48',
          }}
          animate={{ opacity: [0.35, 0.78, 0.35] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          TOCCA PER APRIRE
        </motion.p>
        <motion.svg
          width="16" height="10" viewBox="0 0 16 10" fill="none"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M1 1L8 8L15 1"
            stroke="#7A5E48" strokeOpacity="0.42"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}
