'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Petal({ id, x, delay, duration, size, rotation, color }) {
  return (
    <motion.div
      key={id}
      className="pointer-events-none fixed"
      style={{ left: `${x}%`, top: -20, zIndex: 9999 }}
      initial={{ y: -20, opacity: 0, rotate: 0 }}
      animate={{
        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
        opacity: [0, 1, 1, 0],
        rotate: rotation,
        x: [0, 20, -15, 10, 0],
      }}
      transition={{
        duration,
        delay,
        ease: 'easeInOut',
        times: [0, 0.1, 0.9, 1],
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24">
        <ellipse
          cx="12" cy="12" rx="5" ry="9"
          fill={color}
          opacity="0.8"
          transform="rotate(-20 12 12)"
        />
      </svg>
    </motion.div>
  )
}

export default function PetalRain({ active = false, count = 40 }) {
  const [petals, setPetals] = useState([])

  useEffect(() => {
    if (!active) {
      setPetals([])
      return
    }
    const colors = ['#D4A5A5', '#C9A84C', '#e8c4c4', '#f0d5a0', '#f5b7b1']
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 3,
      size: 12 + Math.floor(Math.random() * 16),
      rotation: 180 + Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setPetals(generated)
  }, [active, count])

  return (
    <AnimatePresence>
      {petals.map((p) => (
        <Petal key={p.id} {...p} />
      ))}
    </AnimatePresence>
  )
}
