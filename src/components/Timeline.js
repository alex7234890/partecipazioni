'use client'

import { motion } from 'framer-motion'
import { WEDDING } from '@/config/wedding'

export default function Timeline() {
  return (
    <section className="py-16 px-4">
      <motion.h2
        className="font-playfair text-3xl sm:text-4xl text-gold text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        La giornata
      </motion.h2>
      <motion.p
        className="text-center text-rose/60 mb-12 tracking-wide"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Il programma del nostro giorno speciale
      </motion.p>

      <div className="relative max-w-lg mx-auto">
        {/* Linea verticale */}
        <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-gold/20 -translate-x-1/2" />

        {WEDDING.timeline.map((item, i) => (
          <motion.div
            key={i}
            className="relative flex items-start gap-6 mb-8 sm:mb-10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            {/* Punto sulla linea */}
            <div className="relative flex-shrink-0 w-16 flex justify-center">
              <div className="w-10 h-10 rounded-full bg-cream border-2 border-gold/50 flex items-center justify-center shadow-sm z-10">
                <span className="text-lg">{item.icon}</span>
              </div>
            </div>

            {/* Contenuto */}
            <div className="flex-1 bg-white rounded-xl border border-gold/20 shadow-sm px-5 py-3 mb-1">
              <div className="flex items-center gap-3">
                <span className="font-playfair text-gold font-semibold text-lg">
                  {item.time}
                </span>
                <span className="text-charcoal/80">{item.label}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
