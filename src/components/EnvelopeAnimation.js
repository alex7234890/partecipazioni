'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

function startAmbientPad() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 5)
    master.connect(ctx.destination)
    ;[130.81, 164.81, 196.00, 246.94].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g   = ctx.createGain()
      osc.type            = 'sine'
      osc.frequency.value = freq
      osc.detune.value    = i % 2 ? 3 : -3
      g.gain.value        = 0.25
      osc.connect(g)
      g.connect(master)
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
      style={{ background: '#EFE8DC' }}
      onClick={handleClick}
      animate={isDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.55 }}
    >
      <audio ref={audioRef} src="/music.mp3" loop preload="none" />

      {/* ── SVG filter definitions (hidden) ── */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          {/* Paper grain — warm brown speckles at low opacity */}
          <filter id="env-paper-grain" x="0%" y="0%" width="100%" height="100%"
            colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.80 0.80"
              numOctaves="4" seed="5" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="matrix"
              values="0 0 0 0 0.52
                      0 0 0 0 0.36
                      0 0 0 0 0.16
                      0 0 0 0.10 0"
              in="noise" />
          </filter>

          {/* Wax surface grain */}
          <filter id="env-wax-grain" x="-5%" y="-5%" width="110%" height="110%"
            colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.60 0.60"
              numOctaves="3" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise"
              scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* ── Paper grain overlay (inline SVG rect filtered) ── */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 1 }}
      >
        <rect width="100%" height="100%" filter="url(#env-paper-grain)" />
      </svg>

      {/* ── Envelope flap shadows — gradient divs with clip-path ── */}

      {/* Bottom flap — darkest, shadow from below */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        clipPath: 'polygon(0% 100%, 100% 100%, 50% 50%)',
        background: 'linear-gradient(to top, #B8AFA0 0%, #CABFB1 45%, transparent 100%)',
      }} />

      {/* Left flap — medium shadow from left edge */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        clipPath: 'polygon(0% 0%, 0% 100%, 50% 50%)',
        background: 'linear-gradient(to right, #C2B9AB 0%, #D0C7B9 50%, transparent 100%)',
      }} />

      {/* Right flap — slightly lighter than left */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        clipPath: 'polygon(100% 0%, 100% 100%, 50% 50%)',
        background: 'linear-gradient(to left, #C5BDB0 0%, #D3CBC0 50%, transparent 100%)',
      }} />

      {/* ── Fold crease lines (highlight + shadow side by side) ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 3 }}
      >
        {/* Top-left crease */}
        <line x1="0" y1="0" x2="50" y2="50" stroke="rgba(255,252,245,0.55)" strokeWidth="0.25" />
        <line x1="0.4" y1="0" x2="50.4" y2="50" stroke="rgba(50,30,10,0.18)" strokeWidth="0.25" />

        {/* Top-right crease */}
        <line x1="100" y1="0" x2="50" y2="50" stroke="rgba(255,252,245,0.45)" strokeWidth="0.25" />
        <line x1="99.6" y1="0" x2="49.6" y2="50" stroke="rgba(50,30,10,0.14)" strokeWidth="0.25" />

        {/* Bottom-left crease */}
        <line x1="0" y1="100" x2="50" y2="50" stroke="rgba(255,252,245,0.40)" strokeWidth="0.22" />
        <line x1="0.4" y1="100" x2="50.4" y2="50" stroke="rgba(50,30,10,0.18)" strokeWidth="0.22" />

        {/* Bottom-right crease */}
        <line x1="100" y1="100" x2="50" y2="50" stroke="rgba(255,252,245,0.38)" strokeWidth="0.22" />
        <line x1="99.6" y1="100" x2="49.6" y2="50" stroke="rgba(50,30,10,0.14)" strokeWidth="0.22" />

        {/* Outer border — thin warm line */}
        <rect x="1.8" y="1.8" width="96.4" height="96.4"
          fill="none" stroke="rgba(100,72,30,0.14)" strokeWidth="0.5" />
      </svg>

      {/* ── Top flap — 3D opening ── */}
      <div style={{
        position: 'absolute', inset: 0,
        perspective: '3500px',
        perspectiveOrigin: '50% 0%',
        zIndex: 6, pointerEvents: 'none',
      }}>
        <motion.div
          style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '50%',
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
          }}
          animate={isOpening ? { rotateX: -172 } : { rotateX: 0 }}
          transition={{ delay: 0.28, duration: 1.45, ease: [0.38, 0, 0.1, 1] }}
        >
          {/* Front face — matches paper color + grain */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(175deg, #EDE6DA 0%, #DED6C8 100%)',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          }}>
            {/* shadow gradient toward point */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(175deg, transparent 30%, rgba(80,55,25,0.10) 100%)',
            }} />
          </div>

          {/* Back face — warm ivory inner lining */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(175deg, #FFFBF4 0%, #FFF5EA 100%)',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }} />
        </motion.div>
      </div>

      {/* ── Inner warm glow when open ── */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(ellipse 75% 55% at 50% 42%, rgba(255,248,218,0.92) 0%, transparent 65%)',
        }}
        initial={{ opacity: 0 }}
        animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.2, duration: 1.3 }}
      />

      {/* ── Wax seal ── */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
      }}>
        <motion.div
          animate={isOpening ? { y: -270, opacity: 0, scale: 0.8 }
                             : { y: 0,    opacity: 1, scale: 1  }}
          transition={{ duration: 0.85, ease: [0.35, 0, 0.18, 1] }}
        >
          {/* Soft drop shadow blob */}
          <div style={{
            position: 'absolute', bottom: -14, left: '6%',
            width: '88%', height: 22, borderRadius: '50%',
            background: 'rgba(55,32,8,0.28)',
            filter: 'blur(12px)',
          }} />

          {/*
            Realistic wax seal:
            - Pale rose-taupe colour (like real lacquer wax)
            - Complex radial gradient for 3D lighting
            - SVG wax-grain filter for surface texture + irregular edge
            - Inner ring to simulate raised pour border
          */}
          <div
            style={{
              position: 'relative',
              width: 134, height: 134,
              borderRadius: '50%',
              /* Wax colour: warm rose-taupe, highlight top-left, shadow bottom-right */
              background: `radial-gradient(
                circle at 36% 30%,
                #E0D1C6 0%,
                #C8B5A8 22%,
                #BBA89B 45%,
                #B39186 62%,
                #BBA49A 80%,
                #AE9A90 100%
              )`,
              boxShadow: [
                '0 6px 30px rgba(40,20,5,0.30)',
                '0 2px 6px rgba(40,20,5,0.18)',
                'inset 0 2px 5px rgba(255,245,235,0.50)',
                'inset 0 1px 2px rgba(255,245,235,0.30)',
                'inset 0 -4px 10px rgba(0,0,0,0.22)',
              ].join(', '),
              /* wax surface grain + irregular edge */
              filter: 'url(#env-wax-grain)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            {/* Inner circle content (clipped separately so filter doesn't blur img) */}
            <div style={{
              width: 130, height: 130,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {/* Raised pour-border ring */}
              <div style={{
                position: 'absolute', inset: 6,
                borderRadius: '50%',
                border: '1.5px solid rgba(195,170,155,0.55)',
                boxShadow: 'inset 0 1px 3px rgba(255,248,238,0.30), 0 1px 0 rgba(90,60,40,0.14)',
                zIndex: 1,
              }} />
              {/* Monogram image — multiply so white background disappears */}
              <img
                src="/monogram.png"
                alt=""
                style={{
                  width: '76%', height: '76%',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply',
                  opacity: 0.78,
                  filter: 'contrast(1.1) brightness(0.88)',
                  position: 'relative', zIndex: 2,
                }}
              />
              {/* Specular sheen top-left */}
              <div style={{
                position: 'absolute', top: '8%', left: '10%',
                width: '38%', height: '32%',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse at 40% 35%, rgba(255,252,248,0.30) 0%, transparent 65%)',
                zIndex: 3,
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Script text ── */}
      <div style={{
        position: 'absolute', left: '50%', top: '67%',
        transform: 'translateX(-50%)',
        zIndex: 10, textAlign: 'center',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isOpening ? { opacity: 0, y: -6 } : { opacity: 0.70, y: 0 }}
          transition={{ duration: 0.35, delay: isOpening ? 0 : 0.85 }}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.05rem, 3.5vw, 1.38rem)',
            color: '#4E3A2B',
            fontStyle: 'italic',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
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
            fontSize: '0.68rem', letterSpacing: '0.28em',
            color: '#6A5040',
          }}
          animate={{ opacity: [0.35, 0.78, 0.35] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          TOCCA PER APRIRE
        </motion.p>
        <motion.svg width="16" height="10" viewBox="0 0 16 10" fill="none"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M1 1L8 8L15 1" stroke="#6A5040" strokeOpacity="0.45"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}
