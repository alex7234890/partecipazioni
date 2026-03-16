'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { WEDDING } from '@/config/wedding'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function WeddingCard({ guestName }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouse = (e) => {
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      setTilt({
        x: ((e.clientY - cy) / (rect.height / 2)) * -4,
        y: ((e.clientX - cx) / (rect.width / 2)) * 4,
      })
    }
    const handleOrientation = (e) => {
      if (e.gamma === null) return
      setTilt({
        x: Math.max(-4, Math.min(4, e.beta * 0.08)),
        y: Math.max(-4, Math.min(4, e.gamma * 0.08)),
      })
    }
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('deviceorientation', handleOrientation)
    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-cream relative overflow-hidden">

      {/* Decorazioni angolari sottilissime */}
      <Corner pos="top-left" />
      <Corner pos="top-right" />
      <Corner pos="bottom-left" />
      <Corner pos="bottom-right" />

      <motion.div
        ref={cardRef}
        style={{ perspective: 1200 }}
        className="w-full max-w-xs sm:max-w-sm"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="relative bg-white overflow-hidden"
          style={{
            boxShadow: '0 20px 60px rgba(44,36,32,0.10), 0 4px 16px rgba(44,36,32,0.06)',
            border: '1px solid rgba(184,150,62,0.22)',
          }}
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        >
          {/* Foto */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <Image
              src="/couple.jpg"
              alt="Matteo e Clio"
              fill
              className="object-cover"
              style={{ filter: 'saturate(0.75) contrast(1.02) brightness(1.04)' }}
              priority
            />
            {/* Vignetta elegante */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 100% 90% at 50% 30%, transparent 50%, rgba(250,247,242,0.55) 100%)',
            }}/>
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, transparent 55%, rgba(255,255,255,0.96) 100%)',
            }}/>
          </div>

          {/* Testo */}
          <div className="px-8 pt-1 pb-10 text-center">
            <p className="label-elegant mb-4">Il matrimonio di</p>

            <h1 className="font-playfair text-charcoal mb-1" style={{ fontSize: 'clamp(1.7rem, 6vw, 2.2rem)', fontWeight: 400, lineHeight: 1.15 }}>
              {WEDDING.groomName}
            </h1>
            <p className="font-playfair text-gold mb-1" style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '0.15em' }}>&amp;</p>
            <h1 className="font-playfair text-charcoal mb-6" style={{ fontSize: 'clamp(1.7rem, 6vw, 2.2rem)', fontWeight: 400, lineHeight: 1.15 }}>
              {WEDDING.brideName}
            </h1>

            {/* Ornamento centrale */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div style={{ height: 1, width: 40, background: 'rgba(184,150,62,0.35)' }}/>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#B8963E" fillOpacity="0.6"/>
              </svg>
              <div style={{ height: 1, width: 40, background: 'rgba(184,150,62,0.35)' }}/>
            </div>

            <p className="font-playfair text-charcoal/60 mb-1" style={{ fontSize: '0.85rem', fontWeight: 400, fontStyle: 'italic' }}>
              {formatDate(WEDDING.date)}
            </p>
            <p className="label-elegant" style={{ color: 'rgba(44,36,32,0.45)' }}>
              ore {WEDDING.time}
            </p>

            {guestName && (
              <p className="font-playfair mt-7 text-rose" style={{ fontSize: '0.82rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                Con affetto vi invitiamo,<br />
                <span className="text-charcoal/60">{guestName}</span>
              </p>
            )}
          </div>

          {/* Bordo interno decorativo */}
          <div className="absolute inset-[6px] pointer-events-none" style={{
            border: '1px solid rgba(184,150,62,0.12)',
          }}/>
        </motion.div>
      </motion.div>

      {/* Freccia scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="label-elegant" style={{ color: 'rgba(184,150,62,0.5)' }}>Scorri</span>
        <motion.svg
          width="14" height="9" viewBox="0 0 14 9" fill="none"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M1 1L7 7L13 1" stroke="#B8963E" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5"/>
        </motion.svg>
      </motion.div>
    </section>
  )
}

function Corner({ pos }) {
  const size = 36
  const styles = {
    'top-left':     { top: 16, left: 16 },
    'top-right':    { top: 16, right: 16, transform: 'scaleX(-1)' },
    'bottom-left':  { bottom: 16, left: 16, transform: 'scaleY(-1)' },
    'bottom-right': { bottom: 16, right: 16, transform: 'scale(-1)' },
  }
  return (
    <div className="absolute pointer-events-none" style={styles[pos]}>
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <path d="M2 18 L2 2 L18 2" stroke="#B8963E" strokeWidth="0.8" strokeOpacity="0.35" fill="none"/>
        <circle cx="2" cy="2" r="1.5" fill="#B8963E" fillOpacity="0.3"/>
      </svg>
    </div>
  )
}
