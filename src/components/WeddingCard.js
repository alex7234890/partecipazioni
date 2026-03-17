'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { WEDDING } from '@/config/wedding'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function WeddingCard({ guestName }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMouse = (e) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      setTilt({
        x: ((e.clientY - cy) / cy) * -10,
        y: ((e.clientX - cx) / cx) *  10,
      })
    }
    const onGyro = (e) => {
      if (e.gamma === null) return
      setTilt({
        x: Math.max(-10, Math.min(10, e.beta  * 0.14)),
        y: Math.max(-10, Math.min(10, e.gamma * 0.14)),
      })
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('deviceorientation', onGyro)
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('deviceorientation', onGyro)
    }
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden flex items-end">

      {/* ── SVG: filtro olio pittura ────────────────────────────────────── */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <filter id="oil-paint" x="-5%" y="-5%" width="110%" height="110%"
            colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise"
              baseFrequency="0.032 0.048" numOctaves="4" seed="6" result="strokes" />
            <feDisplacementMap in="SourceGraphic" in2="strokes"
              scale="5.5" xChannelSelector="R" yChannelSelector="G" result="brushed" />
            <feColorMatrix type="saturate" values="1.65" in="brushed" result="vivid" />
            <feComponentTransfer in="vivid">
              <feFuncR type="linear" slope="1.12" intercept="-0.05" />
              <feFuncG type="linear" slope="1.04" intercept="-0.03" />
              <feFuncB type="linear" slope="0.93" intercept="-0.01" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* ── Foto fullscreen: schiarita + Ken Burns + parallax ────────── */}
      <motion.div
        className="absolute inset-0"
        style={{ perspective: 1400 }}
        animate={{ rotateX: tilt.x * 0.35, rotateY: tilt.y * 0.35 }}
        transition={{ type: 'spring', stiffness: 55, damping: 16 }}
      >
        <motion.div
          className="absolute"
          style={{ inset: '-6%', filter: 'url(#oil-paint)' }}
          animate={{
            scale: [1.00, 1.10, 1.04],
            x:     ['0%',  '2.5%', '-1.5%'],
            y:     ['0%',  '1.5%', '-1%'],
          }}
          transition={{
            duration: 28, ease: 'linear',
            repeat: Infinity, repeatType: 'reverse',
          }}
        >
          <Image
            src="/couple.jpg"
            alt="Matteo e Clio"
            fill
            className="object-cover"
            style={{ filter: 'brightness(1.18) contrast(0.95) saturate(0.90)' }}
            priority
          />
        </motion.div>
      </motion.div>

      {/* Texture tela */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', opacity: 0.03 }}>
        <filter id="canvas-weave">
          <feTurbulence type="fractalNoise" baseFrequency="0.70 0.70"
            numOctaves="3" seed="11" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#canvas-weave)" />
      </svg>

      {/* Vignetta leggera ai bordi */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 85% 80% at 50% 38%, transparent 35%, rgba(8,4,2,0.28) 100%)',
      }} />

      {/* Gradiente basso — ridotto per leggibilità testo nero */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, transparent 45%, rgba(255,255,255,0.32) 100%)',
      }} />

      {/* ── Testo ────────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full text-center"
        style={{ padding: '2rem 1.5rem 38vh' }}
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: '0.60rem', letterSpacing: '0.32em',
          color: 'rgba(0,0,0,0.55)',
          marginBottom: '0.6rem', textTransform: 'uppercase',
        }}>
          Il matrimonio di
        </p>

        {/* Nome sposo — sfalsato a sinistra */}
        <h1 style={{
          fontFamily: "'Allura', cursive",
          fontSize: 'clamp(4.8rem, 18vw, 9rem)',
          fontWeight: 400, lineHeight: 1.05,
          color: '#0A0A0A',
          textShadow: '0 1px 8px rgba(255,255,255,0.25)',
          margin: 0,
          display: 'block',
          transform: 'translateX(-10%)',
        }}>
          {WEDDING.groomName}
        </h1>

        {/* Nome sposa — sfalsata a destra, ravvicinata */}
        <h1 style={{
          fontFamily: "'Allura', cursive",
          fontSize: 'clamp(4.8rem, 18vw, 9rem)',
          fontWeight: 400, lineHeight: 1.05,
          color: '#0A0A0A',
          textShadow: '0 1px 8px rgba(255,255,255,0.25)',
          marginTop: '-0.6rem',
          marginBottom: '1.0rem',
          display: 'block',
          transform: 'translateX(10%)',
        }}>
          {WEDDING.brideName}
        </h1>

        <p style={{
          fontFamily: "'Allura', cursive",
          fontSize: 'clamp(1.15rem, 3.5vw, 1.6rem)',
          color: 'rgba(0,0,0,0.68)',
          marginBottom: '1.2rem',
          letterSpacing: '0.02em',
        }}>
          annunciano il loro matrimonio
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: '1.0rem' }}>
          <div style={{ height: 1, width: 48, background: 'rgba(0,0,0,0.28)' }} />
          <svg width="7" height="7" viewBox="0 0 10 10">
            <path d="M5 0L6.2 3.8L10 5L6.2 6.2L5 10L3.8 6.2L0 5L3.8 3.8Z"
              fill="#333" fillOpacity="0.55" />
          </svg>
          <div style={{ height: 1, width: 48, background: 'rgba(0,0,0,0.28)' }} />
        </div>

        <p style={{
          fontFamily: "'Allura', cursive",
          fontSize: 'clamp(1.1rem, 3.5vw, 1.55rem)',
          color: 'rgba(0,0,0,0.72)',
          marginBottom: '0.2rem',
        }}>
          {formatDate(WEDDING.date)}
        </p>
        <p style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: '0.60rem', letterSpacing: '0.26em',
          color: 'rgba(0,0,0,0.50)',
          marginBottom: '0.4rem',
          textTransform: 'uppercase',
        }}>
          Ore {WEDDING.time}
        </p>
        <p style={{
          fontFamily: "'Allura', cursive",
          fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
          color: 'rgba(0,0,0,0.72)',
          letterSpacing: '0.02em',
        }}>
          {WEDDING.receptionLocation.name}
        </p>

        {guestName && (
          <p style={{
            fontFamily: "'Allura', cursive",
            fontSize: 'clamp(1.1rem, 3.2vw, 1.5rem)',
            lineHeight: 1.75,
            color: 'rgba(0,0,0,0.58)',
            marginTop: '1.6rem',
          }}>
            Con affetto vi invitiamo,<br />
            <span style={{ color: 'rgba(0,0,0,0.65)' }}>{guestName}</span>
          </p>
        )}
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: '0.54rem', letterSpacing: '0.32em',
          color: 'rgba(0,0,0,0.38)',
          textTransform: 'uppercase',
        }}>
          Scorri
        </span>
        <motion.svg width="12" height="8" viewBox="0 0 14 9" fill="none"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M1 1L7 7L13 1" stroke="#333" strokeWidth="1.2"
            strokeLinecap="round" strokeOpacity="0.40" />
        </motion.svg>
      </motion.div>
    </section>
  )
}
