'use client'

import { motion } from 'framer-motion'
import { WEDDING } from '@/config/wedding'

function LocationItem({ location, label, icon, delay }) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-gold/20 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <div className="bg-gradient-to-r from-gold/10 to-rose/10 px-6 py-4 border-b border-gold/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-playfair text-gold font-semibold text-lg">{label}</span>
        </div>
      </div>
      <div className="px-6 py-5">
        <h3 className="font-playfair text-charcoal text-xl font-semibold mb-1">
          {location.name}
        </h3>
        <p className="text-charcoal/60 text-sm mb-4">{location.address}</p>
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gold text-white text-sm px-5 py-2.5 rounded-full hover:bg-gold/90 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Apri in Google Maps
        </a>
      </div>
    </motion.div>
  )
}

export default function LocationCard() {
  return (
    <section className="py-16 px-4">
      <motion.h2
        className="font-playfair text-3xl sm:text-4xl text-gold text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Dove ci troviamo
      </motion.h2>
      <motion.p
        className="text-center text-rose/60 mb-10 tracking-wide"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Le location della nostra giornata
      </motion.p>

      <div className="max-w-2xl mx-auto grid gap-6 sm:grid-cols-2">
        <LocationItem
          location={WEDDING.ceremonyLocation}
          label="Cerimonia"
          icon="💍"
          delay={0.1}
        />
        <LocationItem
          location={WEDDING.receptionLocation}
          label="Ricevimento"
          icon="🥂"
          delay={0.2}
        />
      </div>
    </section>
  )
}
