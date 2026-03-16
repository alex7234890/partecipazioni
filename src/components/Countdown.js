'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WEDDING } from '@/config/wedding'
import PetalRain from './PetalRain'

function pad(n) {
  return String(n).padStart(2, '0')
}

function getTimeLeft(targetDate) {
  const now = new Date()
  const target = new Date(`${targetDate}T${WEDDING.time}:00`)
  const diff = target - now

  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gold/30 rounded-lg shadow-md flex items-center justify-center"
      >
        <span className="font-playfair text-2xl sm:text-3xl text-gold font-bold">
          {pad(value)}
        </span>
      </motion.div>
      <span className="mt-2 text-xs sm:text-sm text-rose/70 tracking-widest uppercase">
        {label}
      </span>
    </div>
  )
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(null)
  const [isToday, setIsToday] = useState(false)
  const [showPetals, setShowPetals] = useState(false)

  useEffect(() => {
    const update = () => {
      const t = getTimeLeft(WEDDING.date)
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
    <section className="py-16 px-4 text-center">
      <PetalRain active={showPetals} count={60} />

      <motion.h2
        className="font-playfair text-3xl sm:text-4xl text-gold mb-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Conto alla rovescia
      </motion.h2>
      <motion.p
        className="text-rose/60 mb-10 tracking-wide"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Mancano ancora...
      </motion.p>

      <AnimatePresence mode="wait">
        {isToday ? (
          <motion.div
            key="today"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8"
          >
            <p className="font-playfair text-3xl sm:text-4xl text-gold">
              È oggi! 🌸
            </p>
            <p className="mt-3 text-xl text-rose/80">Ci vediamo all&apos;altare!</p>
          </motion.div>
        ) : (
          timeLeft && (
            <motion.div
              key="countdown"
              className="flex justify-center gap-4 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <TimeBlock value={timeLeft.days} label="Giorni" />
              <TimeBlock value={timeLeft.hours} label="Ore" />
              <TimeBlock value={timeLeft.minutes} label="Minuti" />
              <TimeBlock value={timeLeft.seconds} label="Secondi" />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </section>
  )
}
