'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import WaxSeal from './WaxSeal'

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
      style={{ background: '#EDE6D9' }}
      onClick={handleClick}
      animate={isDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.55 }}
    >
      <audio ref={audioRef} src="/music.mp3" loop preload="none" />

      {/*
        ══════════════════════════════════════════════════════════════
        SVG filter definitions (hidden — 0×0)
        ══════════════════════════════════════════════════════════════
      */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>

          {/*
            Paper texture: feTurbulence (fiber pattern) +
            feDiffuseLighting (angled 3-D light hitting fibers) +
            feComponentTransfer (keep average brightness near 1.0 so
            the multiply composite doesn't darken too much)
          */}
          <filter id="env-paper-tex" x="0%" y="0%" width="100%" height="100%"
            colorInterpolationFilters="sRGB">
            {/* Anisotropic fiber turbulence — horizontal long fibers */}
            <feTurbulence type="fractalNoise"
              baseFrequency="0.014 0.070"
              numOctaves="5" seed="4" stitchTiles="stitch" result="fibers" />
            {/* Fine surface grain on top */}
            <feTurbulence type="fractalNoise"
              baseFrequency="0.80 0.80"
              numOctaves="2" seed="9" stitchTiles="stitch" result="grain" />
            {/* Blend grain lightly over fibers */}
            <feBlend in="fibers" in2="grain" mode="screen" result="combined" />
            {/* Directional lighting (light from upper-left, low angle) */}
            <feDiffuseLighting in="combined" surfaceScale="2.8"
              diffuseConstant="1.1" lightingColor="white" result="lit">
              <feDistantLight azimuth="225" elevation="68" />
            </feDiffuseLighting>
            {/* Compress range so multiply doesn't kill colour: [0.62, 1.0] */}
            <feComponentTransfer in="lit" result="litAdj">
              <feFuncR type="linear" slope="0.38" intercept="0.62" />
              <feFuncG type="linear" slope="0.38" intercept="0.62" />
              <feFuncB type="linear" slope="0.38" intercept="0.62" />
            </feComponentTransfer>
            {/* Multiply SourceGraphic (the cream rect) with the lit texture */}
            <feComposite in="SourceGraphic" in2="litAdj" operator="multiply" />
          </filter>

          {/* Fine grain overlay (second pass — adds surface pore detail) */}
          <filter id="env-grain" x="0%" y="0%" width="100%" height="100%"
            colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise"
              baseFrequency="0.88 0.88"
              numOctaves="3" seed="6" stitchTiles="stitch" result="pores" />
            <feColorMatrix type="matrix"
              values="0 0 0 0 0.50
                      0 0 0 0 0.34
                      0 0 0 0 0.16
                      0 0 0 0.09 0"
              in="pores" />
          </filter>

        </defs>
      </svg>

      {/*
        ══════════════════════════════════════════════════════════════
        Paper body — the cream rect run through the fiber+lighting filter
        ══════════════════════════════════════════════════════════════
      */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 1 }}
      >
        {/* Base cream — filtered → gets fibers + directional light */}
        <rect width="100%" height="100%" fill="#EDE6D9" filter="url(#env-paper-tex)" />
      </svg>

      {/* Fine grain on top (separate pass, z-index 2) */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 2 }}
      >
        <rect width="100%" height="100%" filter="url(#env-grain)" />
      </svg>

      {/*
        ══════════════════════════════════════════════════════════════
        Envelope flap shadows — CSS clip-path + directional gradients
        Real paper: each flap catches different angle of light.
        ══════════════════════════════════════════════════════════════
      */}

      {/* Bottom flap — deepest shadow (faces downward, away from light) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        clipPath: 'polygon(0% 100%, 100% 100%, 50% 50%)',
        background: 'linear-gradient(to top, rgba(90,55,18,0.22) 0%, rgba(90,55,18,0.06) 50%, transparent 100%)',
      }} />

      {/* Left flap — medium shadow from left edge */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        clipPath: 'polygon(0% 0%, 0% 100%, 50% 50%)',
        background: 'linear-gradient(to right, rgba(80,48,15,0.16) 0%, rgba(80,48,15,0.04) 55%, transparent 100%)',
      }} />

      {/* Right flap — slightly lighter (more light from upper-left source) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        clipPath: 'polygon(100% 0%, 100% 100%, 50% 50%)',
        background: 'linear-gradient(to left, rgba(80,48,15,0.12) 0%, rgba(80,48,15,0.03) 55%, transparent 100%)',
      }} />

      {/*
        ══════════════════════════════════════════════════════════════
        Fold crease lines — double line per crease:
        - bright side (light catches the fold)
        - dark side (shadow inside fold)
        ══════════════════════════════════════════════════════════════
      */}
      <svg
        viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 4 }}
      >
        {/* Top-left crease */}
        <line x1="0"    y1="0"   x2="50"   y2="50" stroke="rgba(255,250,242,0.60)" strokeWidth="0.28" />
        <line x1="0.45" y1="0"   x2="50.45" y2="50" stroke="rgba(60,35,10,0.20)" strokeWidth="0.28" />
        {/* Top-right crease */}
        <line x1="100"    y1="0"   x2="50"    y2="50" stroke="rgba(255,250,242,0.50)" strokeWidth="0.28" />
        <line x1="99.55"  y1="0"   x2="49.55" y2="50" stroke="rgba(60,35,10,0.16)" strokeWidth="0.28" />
        {/* Bottom-left crease */}
        <line x1="0"    y1="100" x2="50"   y2="50" stroke="rgba(255,250,242,0.44)" strokeWidth="0.24" />
        <line x1="0.45" y1="100" x2="50.45" y2="50" stroke="rgba(60,35,10,0.19)" strokeWidth="0.24" />
        {/* Bottom-right crease */}
        <line x1="100"   y1="100" x2="50"    y2="50" stroke="rgba(255,250,242,0.42)" strokeWidth="0.24" />
        <line x1="99.55" y1="100" x2="49.55" y2="50" stroke="rgba(60,35,10,0.15)" strokeWidth="0.24" />
        {/* Outer border */}
        <rect x="1.8" y="1.8" width="96.4" height="96.4"
          fill="none" stroke="rgba(90,60,22,0.15)" strokeWidth="0.55" />
      </svg>

      {/*
        ══════════════════════════════════════════════════════════════
        Top flap — CSS 3D opening animation
        ══════════════════════════════════════════════════════════════
      */}
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
          {/* Front face — cream paper with same texture feel */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(170deg, #EBE4D5 0%, #DDD6C5 100%)',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          }}>
            {/* Gradient shadow toward the fold point */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(170deg, transparent 25%, rgba(70,42,12,0.12) 100%)',
            }} />
          </div>
          {/* Back face — warm ivory inner lining */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(170deg, #FDFAF2 0%, #FBF4E4 100%)',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }} />
        </motion.div>
      </div>

      {/* Inner warm glow when open */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: 'radial-gradient(ellipse 75% 55% at 50% 43%, rgba(255,248,215,0.90) 0%, transparent 65%)',
        }}
        initial={{ opacity: 0 }}
        animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.22, duration: 1.3 }}
      />

      {/*
        ══════════════════════════════════════════════════════════════
        Wax seal — Canvas component
        ══════════════════════════════════════════════════════════════
      */}
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
          <WaxSeal size={140} />
        </motion.div>
      </div>

      {/* Script text */}
      <div style={{
        position: 'absolute', left: '50%', top: '67%',
        transform: 'translateX(-50%)', zIndex: 10, textAlign: 'center',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isOpening ? { opacity: 0, y: -6 } : { opacity: 0.72, y: 0 }}
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
