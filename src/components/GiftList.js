'use client'

import { motion } from 'framer-motion'
import { WEDDING } from '@/config/wedding'

export default function GiftList() {
  return (
    <section className="py-16 px-4 text-center">
      <motion.h2
        className="font-playfair text-3xl sm:text-4xl text-gold mb-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Lista nozze
      </motion.h2>
      <motion.p
        className="text-rose/60 mb-10 max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Se desiderate farci un regalo, abbiamo preparato una lista con tutto ciò che ci serve per il nostro nido d&apos;amore.
      </motion.p>

      <motion.a
        href={WEDDING.giftListUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-white border-2 border-gold text-gold font-playfair text-lg px-8 py-4 rounded-full shadow-md hover:bg-gold hover:text-white transition-all duration-300"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <span>🎁</span>
        Sfoglia la lista regali
      </motion.a>
    </section>
  )
}
