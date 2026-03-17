'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

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
  const [phase, setPhase]           = useState('idle') // idle | playing | done
  const [videoReady, setVideoReady] = useState(false)
  const videoRef  = useRef(null)
  const timerRef  = useRef(null)
  const playedRef = useRef(false)

  const handleTap = () => {
    if (phase !== 'idle') return
    setPhase('playing')

    // Avvia musica di sottofondo (solo al primo tocco)
    if (!playedRef.current) {
      playedRef.current = true
      const audio = getOrCreateAudio()
      if (audio) audio.play().catch(() => {})
    }

    // Avvia video (muto — l'audio è gestito da music.mp3)
    if (videoRef.current) videoRef.current.play()

    // Dopo 3s dal tocco: dissolvi e apri la partecipazione
    timerRef.current = setTimeout(() => {
      setPhase('done')
      setTimeout(() => onOpen?.(), 650)
    }, 3000)
  }

  const isIdle = phase === 'idle'
  const isDone = phase === 'done'

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden cursor-pointer"
      style={{ background: '#EDE6D9' }}
      animate={isDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.65 }}
      onClick={handleTap}
    >
      {/* ── Sfondo parchment — visibile su iOS prima che il video si carichi ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#EDE6D9',
        backgroundImage: "url('/envelope-bg.png'), url('/envelope-bg.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        zIndex: 0,
      }} />

      {/* ── Video busta — opacità 0 finché iOS non ha il primo frame ────── */}
      <video
        ref={videoRef}
        src="/envelope-video.mp4"
        playsInline
        muted
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.22)',
          transformOrigin: 'center center',
          zIndex: 1,
          opacity: videoReady ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* ── Hint "tocca per aprire" — scompare al tocco ─────────────────── */}
      <motion.div
        style={{
          position: 'absolute', bottom: '8%', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          zIndex: 10,
          pointerEvents: 'none',
        }}
        animate={{ opacity: isIdle ? 1 : 0 }}
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
