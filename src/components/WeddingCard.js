'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { WEDDING } from '@/config/wedding'
import FlowerDecoration from './FlowerDecoration'

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

  // Parallax mouse/gyroscope
  useEffect(() => {
    const handleMouse = (e) => {
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      setTilt({ x: dy * -6, y: dx * 6 })
    }
    const handleOrientation = (e) => {
      if (e.gamma === null) return
      setTilt({
        x: Math.max(-6, Math.min(6, e.beta * 0.1)),
        y: Math.max(-6, Math.min(6, e.gamma * 0.1)),
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
    <section className="min-h-screen flex items-center justify-center py-16 px-4 bg-cream relative overflow-hidden">
      <FlowerDecoration position="top-left" />
      <FlowerDecoration position="top-right" />
      <FlowerDecoration position="bottom-left" />
      <FlowerDecoration position="bottom-right" />

      <motion.div
        ref={cardRef}
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gold/20"
        style={{ perspective: 1000 }}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
      >
        {/* Foto sposi con overlay acquerello */}
        <div className="relative h-72 sm:h-80 w-full overflow-hidden">
          <Image
            src="/couple.jpg"
            alt="Matteo e Clio"
            fill
            className="object-cover"
            style={{
              filter: 'saturate(0.8) contrast(1.05) brightness(1.05)',
            }}
            priority
          />
          {/* Overlay acquerello */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 40%, rgba(250,247,242,0.4) 100%),
                           linear-gradient(to bottom, rgba(201,168,76,0.08) 0%, rgba(212,165,165,0.12) 100%)`,
              mixBlendMode: 'multiply',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'w\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23w)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
              mixBlendMode: 'overlay',
            }}
          />
          {/* Degradé verso il basso */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Contenuto testuale */}
        <div className="px-8 pb-8 pt-2 text-center relative">
          <motion.p
            className="text-rose/60 text-sm tracking-[0.3em] uppercase mb-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Il matrimonio di
          </motion.p>
          <motion.h1
            className="font-playfair text-3xl sm:text-4xl text-gold font-bold mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            {WEDDING.groomName} &amp; {WEDDING.brideName}
          </motion.h1>
          <motion.div
            className="w-16 h-px bg-gold/40 mx-auto mb-4"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          />
          <motion.p
            className="text-charcoal/70 text-sm mb-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            {formatDate(WEDDING.date)} · ore {WEDDING.time}
          </motion.p>

          {guestName && (
            <motion.p
              className="mt-4 text-rose/70 italic text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              Caro/a {guestName}, sei invitato/a a celebrare con noi
            </motion.p>
          )}
        </div>
      </motion.div>
    </section>
  )
}
