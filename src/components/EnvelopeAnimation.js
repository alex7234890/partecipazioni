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
    setTimeout(() => setPhase('done'),  2350)
    setTimeout(() => onOpen?.(),        2850)
  }

  const isOpening = phase === 'opening' || phase === 'done'
  const isDone    = phase === 'done'

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden"
      onClick={handleClick}
      animate={isDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.55 }}
    >
      <audio ref={audioRef} src="/music.mp3" loop preload="none" />

      {/* ── Envelope background photo ───────────────────────────────────
          Accetta entrambi i nomi:
            /public/envelope-bg.png  ← priorità
            /public/envelope-bg.jpg  ← fallback automatico
          Fallback colore crema se nessun file è presente.
      ────────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#EDE6D9',                        /* fallback colore */
        backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* ── Fold crease lines on top of the photo ──────────────────────
          Subtle lines that make the envelope diamond-fold visible.
      ────────────────────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 2 }}
      >
        {/* Each fold: bright highlight line + dark shadow line side by side */}
        <line x1="0"    y1="0"    x2="50"    y2="50"  stroke="rgba(255,252,242,0.55)" strokeWidth="0.28" />
        <line x1="0.45" y1="0"    x2="50.45" y2="50"  stroke="rgba(40,20,5,0.18)"    strokeWidth="0.28" />

        <line x1="100"   y1="0"    x2="50"    y2="50"  stroke="rgba(255,252,242,0.45)" strokeWidth="0.28" />
        <line x1="99.55" y1="0"    x2="49.55" y2="50"  stroke="rgba(40,20,5,0.14)"    strokeWidth="0.28" />

        <line x1="0"    y1="100"  x2="50"    y2="50"  stroke="rgba(255,252,242,0.40)" strokeWidth="0.24" />
        <line x1="0.45" y1="100"  x2="50.45" y2="50"  stroke="rgba(40,20,5,0.17)"    strokeWidth="0.24" />

        <line x1="100"   y1="100" x2="50"    y2="50"  stroke="rgba(255,252,242,0.38)" strokeWidth="0.24" />
        <line x1="99.55" y1="100" x2="49.55" y2="50"  stroke="rgba(40,20,5,0.13)"    strokeWidth="0.24" />

        {/* Outer border */}
        <rect x="1.8" y="1.8" width="96.4" height="96.4"
          fill="none" stroke="rgba(80,50,18,0.14)" strokeWidth="0.55" />
      </svg>

      {/* ── Flap shadow overlays ────────────────────────────────────────
          Darken bottom / left / right sections to give depth.
          Tweak the rgba alpha values if your photo already has shadows.
      ────────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        clipPath: 'polygon(0% 100%, 100% 100%, 50% 50%)',
        background: 'linear-gradient(to top, rgba(0,0,0,0.14) 0%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        clipPath: 'polygon(0% 0%, 0% 100%, 50% 50%)',
        background: 'linear-gradient(to right, rgba(0,0,0,0.10) 0%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        clipPath: 'polygon(100% 0%, 100% 100%, 50% 50%)',
        background: 'linear-gradient(to left, rgba(0,0,0,0.08) 0%, transparent 100%)',
      }} />

      {/* ── Top flap — 3D opening animation ────────────────────────────
          The flap uses the same background photo so it looks seamless.
      ────────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        perspective: '3500px', perspectiveOrigin: '50% 0%',
        zIndex: 6, pointerEvents: 'none',
      }}>
        <motion.div
          style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '50%',
            transformOrigin: 'top center', transformStyle: 'preserve-3d',
          }}
          animate={isOpening ? { rotateX: -172 } : { rotateX: 0 }}
          transition={{ delay: 0.28, duration: 1.45, ease: [0.38, 0, 0.10, 1] }}
        >
          {/* Front face — same photo, cropped to the top triangle */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(170deg, transparent 20%, rgba(0,0,0,0.10) 100%)',
            }} />
          </div>
          {/* Back face — warm ivory inner lining */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(170deg, #FDFAF2 0%, #FAF3E2 100%)',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }} />
        </motion.div>
      </div>

      {/* Inner warm glow when open */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: 'radial-gradient(ellipse 75% 55% at 50% 43%, rgba(255,248,215,0.88) 0%, transparent 65%)',
        }}
        initial={{ opacity: 0 }}
        animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.22, duration: 1.3 }}
      />

      {/* ── Wax seal image ──────────────────────────────────────────────
          Put your image at:  /public/wax-seal.png
          PNG with transparent background = best result (no white square).
          JPG also works — gets clipped to a circle automatically.
      ────────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
      }}>
        <motion.div
          animate={isOpening ? { y: -280, opacity: 0, scale: 0.78 }
                             : { y: 0,    opacity: 1, scale: 1   }}
          transition={{ duration: 0.88, ease: [0.35, 0, 0.18, 1] }}
        >
          {/* Drop shadow behind the seal */}
          <div style={{
            position: 'absolute', bottom: -14, left: '8%',
            width: '84%', height: 22, borderRadius: '50%',
            background: 'rgba(40,20,5,0.30)',
            filter: 'blur(12px)',
          }} />

          <img
            src="/wax-seal.png"
            alt=""
            style={{
              display: 'block',
              width: 140,
              height: 140,
              objectFit: 'cover',
              borderRadius: '50%',      /* clips JPG to circle; PNG transparent = no effect */
              position: 'relative',
            }}
          />
        </motion.div>
      </div>

      {/* Script text below seal */}
      <div style={{
        position: 'absolute', left: '50%', top: '67%',
        transform: 'translateX(-50%)', zIndex: 10, textAlign: 'center',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isOpening ? { opacity: 0, y: -6 } : { opacity: 0.75, y: 0 }}
          transition={{ duration: 0.35, delay: isOpening ? 0 : 0.85 }}
          style={{
            fontFamily: "'Dancing Script', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.05rem, 3.5vw, 1.40rem)',
            color: '#5A4130',
            whiteSpace: 'nowrap',
          }}
        >
          Questo invito è solo per te
        </motion.p>
      </div>

      {/* Tap hint */}
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
          animate={{ opacity: [0.35, 0.80, 0.35] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          TOCCA PER APRIRE
        </motion.p>
        <motion.svg width="16" height="10" viewBox="0 0 16 10" fill="none"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M1 1L8 8L15 1" stroke="#7A5E48" strokeOpacity="0.45"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}
