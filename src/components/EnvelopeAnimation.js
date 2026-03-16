'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function EnvelopeAnimation({ onOpen }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCard, setShowCard] = useState(false)

  const handleOpen = () => {
    if (isOpen) return
    setIsOpen(true)
    setTimeout(() => {
      setShowCard(true)
      setTimeout(() => {
        onOpen?.()
      }, 800)
    }, 900)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="flex flex-col items-center gap-8">
        <motion.p
          className="font-playfair text-gold text-lg tracking-widest"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Hai ricevuto un invito
        </motion.p>

        {/* Busta */}
        <motion.div
          className="relative cursor-pointer select-none"
          onClick={handleOpen}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          {/* Corpo busta */}
          <div className="relative w-[320px] sm:w-[400px] shadow-2xl">
            <svg
              viewBox="0 0 400 280"
              className="w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Corpo principale */}
              <rect x="0" y="0" width="400" height="280" rx="8" fill="#FAF7F2" stroke="#C9A84C" strokeWidth="1.5"/>

              {/* Patta inferiore */}
              <path d="M0 280 L200 160 L400 280 Z" fill="#F0EBE3" stroke="#C9A84C" strokeWidth="1.5"/>

              {/* Lati */}
              <path d="M0 0 L200 130 L0 280" fill="#F5F0EA" stroke="#C9A84C" strokeWidth="1"/>
              <path d="M400 0 L200 130 L400 280" fill="#F5F0EA" stroke="#C9A84C" strokeWidth="1"/>

              {/* Patta superiore */}
              <motion.path
                d="M0 0 L200 140 L400 0 Z"
                fill="#FAF7F2"
                stroke="#C9A84C"
                strokeWidth="1.5"
                style={{ transformOrigin: '200px 0px' }}
                animate={isOpen ? { rotateX: -180, y: -10 } : { rotateX: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />

              {/* Sigillo / Monogramma */}
              <motion.g
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <circle cx="200" cy="130" r="32" fill="#FAF7F2" stroke="#C9A84C" strokeWidth="1.5"/>
                <text
                  x="200"
                  y="137"
                  textAnchor="middle"
                  fontFamily="serif"
                  fontSize="26"
                  fill="#C9A84C"
                  fontWeight="bold"
                >
                  MC
                </text>
              </motion.g>
            </svg>

            {/* Carta che emerge */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 bg-white rounded shadow-lg"
                  style={{ width: '75%', bottom: 20, zIndex: 10 }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -80, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                >
                  <div className="h-20 border border-gold/30 rounded p-3 flex items-center justify-center">
                    <span className="font-playfair text-gold text-sm tracking-widest">Matteo &amp; Clio</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          className="text-rose/70 text-sm tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ delay: 1 }}
        >
          Tocca per aprire
        </motion.p>
      </div>
    </div>
  )
}
