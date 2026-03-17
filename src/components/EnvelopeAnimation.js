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
  const [phase, setPhase] = useState('idle') // idle | playing | done
  const videoRef  = useRef(null)
  const playedRef = useRef(false)

  const handleSealClick = () => {
    if (phase !== 'idle') return

    // Avvia la musica al primo tocco
    if (!playedRef.current) {
      playedRef.current = true
      const audio = getOrCreateAudio()
      if (audio) audio.play().catch(() => {})
    }

    setPhase('playing')
    if (videoRef.current) videoRef.current.play()
  }

  const handleVideoEnd = () => {
    setPhase('done')
    setTimeout(() => onOpen?.(), 650)
  }

  const isIdle = phase === 'idle'
  const isDone = phase === 'done'

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: '#EDE6D9' }}
      animate={isDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.65 }}
    >
      {/* ── Video busta ────────────────────────────────────────────────── */}
      {/* Metti il file /public/envelope-video.mp4 (video della busta che si apre).
          Il video parte fermo al primo frame; al tocco del sigillo si avvia.  */}
      <video
        ref={videoRef}
        src="/envelope-video.mp4"
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* ── Sigillo cliccabile (scompare non appena il video parte) ──── */}
      <motion.div
        onClick={handleSealClick}
        style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          cursor: 'pointer',
          width: 160, height: 160,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        animate={{ opacity: isIdle ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <img
          src="/wax-seal.png"
          alt=""
          style={{
            width: 140, height: 140,
            objectFit: 'contain',
            mixBlendMode: 'multiply',
          }}
        />
      </motion.div>

      {/* ── Hint "tocca il sigillo" ─────────────────────────────────── */}
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
          TOCCA IL SIGILLO PER APRIRE
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
