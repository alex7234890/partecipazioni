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

  useEffect(() => {
    const audio = getOrCreateAudio()
    if (!audio) return
    audio.play().catch(() => {})
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
      style={{
        /* ── 5. Envelope body edge depth ── */
        boxShadow: [
          'inset 0 0 12px rgba(0,0,0,0.08)',
          'inset 0 0 3px rgba(0,0,0,0.05)',
          '0 4px 24px rgba(0,0,0,0.15)',
          '0 1px 4px rgba(0,0,0,0.10)',
        ].join(', '),
      }}
    >
      {/* ── 1. Background photo ───────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#EDE6D9',
        backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />

      {/* ══════════════════════════════════════════════════════════════════
          2. FOLD SHADOW OVERLAYS
          preserveAspectRatio="none" → i vertici (0,0)(100,0)(50,50)…
          si mappano esattamente agli angoli e al centro dello schermo,
          indipendentemente dall'aspect ratio del dispositivo.

          Luce simulata da top-left:
            Top    → più chiaro  (rivolto verso la luce)
            Left   → leggermente chiaro
            Right  → leggermente scuro
            Bottom → più scuro  (in ombra, coperto dagli altri lembi)
      ═══════════════════════════════════════════════════════════════════ */}
      <svg
        viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 2 }}
      >
        <polygon points="0,0 100,0 50,50"   fill="rgba(255,255,255,0.08)" />
        <polygon points="0,0 50,50 0,100"   fill="rgba(255,255,255,0.05)" />
        <polygon points="100,0 100,100 50,50" fill="rgba(0,0,0,0.06)" />
        <polygon points="0,100 100,100 50,50" fill="rgba(0,0,0,0.10)" />
      </svg>

      {/* ══════════════════════════════════════════════════════════════════
          3. FOLD CREASE LINES — imperfect bezier + doppia linea embossed
          Ogni piega = 2 path paralleli a distanza 0.5 unità:
            • Lato luce  → rgba(255,255,255,0.35)  highlight
            • Lato ombra → rgba(0,0,0,0.18)         shadow
          Il risultato simula una piega in rilievo su carta reale.

          Curve quadratiche: il punto di controllo è spostato di ~2 unità
          rispetto al centro della retta per dare "memoria" alla carta.
            Top-left   (0,0 → 50,50):  Q 24,22  → bow upward
            Top-right  (100,0 → 50,50): Q 76,22  → bow upward
            Bottom-left  (0,100 → 50,50): Q 24,78 → bow downward
            Bottom-right (100,100→ 50,50): Q 76,78 → bow downward
      ═══════════════════════════════════════════════════════════════════ */}
      <svg
        viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 3 }}
      >
        {/* Top-left fold */}
        <path d="M 0,0 Q 24,22 50,50"
          stroke="rgba(255,255,255,0.36)" strokeWidth="0.55" fill="none" />
        <path d="M 0.5,0 Q 24.5,22.4 50.5,50"
          stroke="rgba(0,0,0,0.19)" strokeWidth="0.55" fill="none" />

        {/* Top-right fold */}
        <path d="M 100,0 Q 76,22 50,50"
          stroke="rgba(255,255,255,0.36)" strokeWidth="0.55" fill="none" />
        <path d="M 99.5,0 Q 75.5,22.4 49.5,50"
          stroke="rgba(0,0,0,0.19)" strokeWidth="0.55" fill="none" />

        {/* Bottom-left fold */}
        <path d="M 0,100 Q 24,78 50,50"
          stroke="rgba(255,255,255,0.26)" strokeWidth="0.48" fill="none" />
        <path d="M 0.5,100 Q 24.5,77.6 50.5,50"
          stroke="rgba(0,0,0,0.16)" strokeWidth="0.48" fill="none" />

        {/* Bottom-right fold */}
        <path d="M 100,100 Q 76,78 50,50"
          stroke="rgba(255,255,255,0.22)" strokeWidth="0.48" fill="none" />
        <path d="M 99.5,100 Q 75.5,77.6 49.5,50"
          stroke="rgba(0,0,0,0.14)" strokeWidth="0.48" fill="none" />

        {/* Outer border — lieve spessore carta */}
        <rect x="1.2" y="1.2" width="97.6" height="97.6"
          fill="none" stroke="rgba(70,40,12,0.13)" strokeWidth="0.6" />
      </svg>

      {/* ── 4a. Dynamic cast shadow — cresce sotto il lembo mentre si apre
              Posizionato appena sotto la piega centrale (50% → 75% height).
              filter blur simula la diffusione dell'ombra su carta.      ── */}
      <motion.div
        style={{
          position: 'absolute', left: 0, right: 0,
          top: '38%', height: '20%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 4,
          filter: 'blur(10px)',
          transformOrigin: 'top center',
        }}
        initial={{ opacity: 0, scaleY: 0.4 }}
        animate={isOpening
          ? { opacity: 1, scaleY: 1 }
          : { opacity: 0, scaleY: 0.4 }
        }
        transition={{ delay: 0.20, duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      {/* ── 4b. Seal drop shadow — sul corpo busta, sparisce all'apertura ── */}
      <motion.div
        style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%) translateY(52px)',
          width: 118, height: 20,
          borderRadius: '50%',
          background: 'rgba(38,18,4,0.28)',
          filter: 'blur(13px)',
          pointerEvents: 'none', zIndex: 4,
        }}
        animate={{ opacity: isOpening ? 0 : 0.90 }}
        transition={{ duration: 0.30 }}
      />

      {/* ── 5. Warm inner glow when open ─────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: 'radial-gradient(ellipse 70% 52% at 50% 44%, rgba(255,248,210,0.92) 0%, transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.14, duration: 1.5 }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          6. TOP FLAP — 3D opening animation
          ──────────────────────────────────────────────────────────────
          • perspective: 600px → effetto 3D percepibile, fisico
          • perspectiveOrigin: 50% 0% → punto di fuga al top-center
          • transformOrigin: top center → cerniera sulla piega superiore
          • Spring: stiffness 36 / damping 8.5 / mass 1.8
            ζ ≈ 0.53 → leggermente sottosterzato, overshoot ~14%
          • rotateX: -160 → il lembo si apre oltre la perpendicolare
            ma non torna sul retro (backface scompare a ±90°)
          • Il SIGILLO è figlio del lembo: si stacca con lui in 3D.
            backfaceVisibility:hidden → sparisce naturalmente
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        perspective: '600px',
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
          animate={isOpening ? { rotateX: -160 } : { rotateX: 0 }}
          transition={isOpening
            ? {
                delay: 0.16,
                type: 'spring',
                stiffness: 36,
                damping: 8.5,
                mass: 1.8,
              }
            : { duration: 0.35, ease: 'easeOut' }
          }
        >
          {/* ── Fronte del lembo — immagine continua con overlay luce ── */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
            backgroundSize: 'cover', backgroundPosition: 'center top',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          }}>
            {/* Luce top-left sul lembo superiore */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(155deg, rgba(255,255,255,0.09) 0%, transparent 55%, rgba(0,0,0,0.08) 100%)',
            }} />
            {/* Ombra verso la piega — suggerisce spessore */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.11) 100%)',
            }} />
          </div>

          {/* ── Retro del lembo — avorio caldo + riflesso carta ── */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(170deg, #FEFBF4 0%, #FAF1DC 55%, #F5E8CA 100%)',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'radial-gradient(ellipse 55% 75% at 50% 0%, rgba(255,255,255,0.38) 0%, transparent 68%)',
            }} />
          </div>

          {/* ── Sigillo — incollato al lembo, si stacca con lui in 3D ── */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: '50%',
            transform: 'translate(-50%, 50%)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}>
            <img
              src="/wax-seal.png"
              alt=""
              style={{
                display: 'block',
                width: 140, height: 140,
                objectFit: 'contain',
                mixBlendMode: 'multiply',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Hint tocca ───────────────────────────────────────────────────── */}
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
