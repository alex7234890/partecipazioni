'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WEDDING } from '@/config/wedding'
import PetalRain from './PetalRain'

function pad(n) { return String(n).padStart(2, '0') }

function getTimeLeft() {
  const now = new Date()
  const target = new Date(`${WEDDING.date}T${WEDDING.time}:00`)
  const diff = target - now
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  }
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center" style={{ minWidth: 64 }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          className="font-playfair text-charcoal"
          style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 400, lineHeight: 1, display: 'block' }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
        >
          {pad(value)}
        </motion.span>
      </AnimatePresence>
      <span className="label-elegant mt-2" style={{ color: 'rgba(184,150,62,0.7)' }}>{label}</span>
    </div>
  )
}

function Dot() {
  return (
    <span className="font-playfair text-gold/30 pb-4" style={{ fontSize: '2rem', lineHeight: 1, alignSelf: 'flex-end', paddingBottom: '1.4rem' }}>·</span>
  )
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(null)
  const [isToday, setIsToday] = useState(false)
  const [showPetals, setShowPetals] = useState(false)

  useEffect(() => {
    const update = () => {
      const t = getTimeLeft()
      if (!t) {
        setIsToday(true)
        setShowPetals(true)
        setTimeout(() => setShowPetals(false), 6000)
      } else {
        setTimeLeft(t)
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="py-24 px-4 text-center">
      <PetalRain active={showPetals} count={60} />

      <motion.p
        className="label-elegant mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Mancano ancora
      </motion.p>
      <motion.h2
        className="font-playfair text-charcoal mb-12"
        style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 400 }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Al giorno più bello
      </motion.h2>

      <AnimatePresence mode="wait">
        {isToday ? (
          <motion.div
            key="today"
            className="py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="font-playfair text-gold" style={{ fontSize: '2rem', fontWeight: 400 }}>
              È oggi
            </p>
            <p className="font-playfair text-charcoal/50 mt-3" style={{ fontStyle: 'italic' }}>
              Ci vediamo all&apos;altare
            </p>
          </motion.div>
        ) : (
          timeLeft && (
            <motion.div
              key="timer"
              className="flex items-end justify-center gap-2 sm:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Unit value={timeLeft.days}    label="giorni"   />
              <Dot />
              <Unit value={timeLeft.hours}   label="ore"      />
              <Dot />
              <Unit value={timeLeft.minutes} label="minuti"   />
              <Dot />
              <Unit value={timeLeft.seconds} label="secondi"  />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </section>
  )
}
