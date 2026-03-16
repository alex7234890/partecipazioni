'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// Dimensioni busta
const W = 340
const H = 230
// Punto di convergenza dei lembi (centro geometrico)
const CX = W / 2      // 170
const CY = Math.round(H * 0.52)  // 120 — un po' sopra la metà, come le buste vere

export default function EnvelopeAnimation({ onOpen }) {
  const [phase, setPhase] = useState('idle') // idle | opening

  const handleClick = () => {
    if (phase !== 'idle') return
    setPhase('opening')
    // onOpen dopo che la carta è uscita
    setTimeout(() => onOpen?.(), 2800)
  }

  const isOpening = phase === 'opening'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cream gap-10 cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Titolo */}
      <motion.p
        className="font-playfair text-gold tracking-[0.3em] text-base"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: isOpening ? 0 : 1, y: 0 }}
        transition={{ duration: 0.4, delay: isOpening ? 0 : 0.6 }}
      >
        Hai ricevuto un invito
      </motion.p>

      {/* Contenitore con prospettiva 3D */}
      <div style={{ perspective: '1100px', perspectiveOrigin: '50% 40%' }}>
        <motion.div
          className="relative"
          style={{ width: W, height: H }}
          /* Fluttuazione continua prima dell'apertura */
          animate={!isOpening ? { y: [0, -7, 0], rotateX: [0, 1.5, 0] } : { y: 0 }}
          transition={{ duration: 4, repeat: isOpening ? 0 : Infinity, ease: 'easeInOut' }}
        >

          {/* ── Ombra sotto la busta ── */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: -14,
              left: '8%',
              width: '84%',
              height: 22,
              borderRadius: '50%',
              background: 'rgba(100,70,30,0.18)',
              filter: 'blur(12px)',
            }}
            animate={isOpening ? { scaleX: 0.6, opacity: 0 } : { scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* ── Corpo busta (base) ── */}
          <div
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 10,
              background: '#FAF7F2',
              boxShadow: '0 8px 40px rgba(80,50,20,0.13), 0 2px 8px rgba(80,50,20,0.08)',
            }}
          >
            {/* Luce calda interna — appare quando si apre */}
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                borderRadius: 10,
                background: 'radial-gradient(ellipse 80% 60% at 50% 20%, #fff8e8 0%, transparent 80%)',
              }}
              initial={{ opacity: 0 }}
              animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
            />
          </div>

          {/* ── SVG: lembi fissi (basso, sinistra, destra) + linee di piega ── */}
          <svg
            style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
            width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          >
            {/* Lembo inferiore */}
            <polygon
              points={`0,${H} ${W},${H} ${CX},${CY}`}
              fill="#E6DDD0"
            />
            {/* Lembo sinistro */}
            <polygon
              points={`0,0 0,${H} ${CX},${CY}`}
              fill="#EDE5D8"
            />
            {/* Lembo destro */}
            <polygon
              points={`${W},0 ${W},${H} ${CX},${CY}`}
              fill="#E8DFD2"
            />
            {/* Linee di piega */}
            <line x1={0}   y1={0}   x2={CX} y2={CY} stroke="#C9A84C" strokeWidth="0.7" strokeOpacity="0.22"/>
            <line x1={W}   y1={0}   x2={CX} y2={CY} stroke="#C9A84C" strokeWidth="0.7" strokeOpacity="0.22"/>
            <line x1={0}   y1={H}   x2={CX} y2={CY} stroke="#C9A84C" strokeWidth="0.7" strokeOpacity="0.22"/>
            <line x1={W}   y1={H}   x2={CX} y2={CY} stroke="#C9A84C" strokeWidth="0.7" strokeOpacity="0.22"/>
            {/* Bordo esterno busta */}
            <rect x="0.5" y="0.5" width={W-1} height={H-1} rx="9.5"
              fill="none" stroke="#C9A84C" strokeWidth="0.9" strokeOpacity="0.4"/>
          </svg>

          {/* ── Cartoncino interno che emerge ── */}
          <motion.div
            style={{
              position: 'absolute',
              left: '50%', x: '-50%',
              width: '74%',
              height: '84%',
              zIndex: 5,
              borderRadius: 7,
              background: 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)',
              boxShadow: '0 4px 20px rgba(80,50,20,0.15)',
              border: '1px solid rgba(201,168,76,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            initial={{ y: '14%' }}
            animate={isOpening ? { y: '-60%' } : { y: '14%' }}
            transition={{ delay: 1.0, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#C9A84C',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
              }}>
                M &amp; C
              </p>
              <div style={{ width: 32, height: 1, background: 'rgba(201,168,76,0.4)', margin: '6px auto' }}/>
              <p style={{ fontFamily: "'Lato', sans-serif", color: 'rgba(61,53,53,0.45)', fontSize: 10, letterSpacing: 2 }}>
                PARTECIPAZIONE
              </p>
            </div>
          </motion.div>

          {/* ── Lembo superiore (si apre in 3D) ── */}
          <motion.div
            style={{
              position: 'absolute',
              left: 0, right: 0, top: 0,
              height: CY + 4,           // altezza esatta del lembo
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              zIndex: 15,
            }}
            animate={isOpening ? { rotateX: -172 } : { rotateX: 0 }}
            transition={{ delay: 0.28, duration: 1.05, ease: [0.4, 0, 0.15, 1] }}
          >
            {/* Faccia frontale del lembo */}
            <svg
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              viewBox={`0 0 ${W} ${CY + 4}`}
            >
              <defs>
                <linearGradient id="flapFront" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F2EBE0"/>
                  <stop offset="100%" stopColor="#EDE4D6"/>
                </linearGradient>
              </defs>
              {/* Lembo superiore: triangolo con punta verso il basso */}
              <polygon points={`0,0 ${W},0 ${CX},${CY}`} fill="url(#flapFront)"/>
              {/* Bordo superiore busta */}
              <line x1="0" y1="0.5" x2={W} y2="0.5" stroke="#C9A84C" strokeWidth="0.9" strokeOpacity="0.4"/>
              {/* Linee di piega del lembo */}
              <line x1="0" y1="0" x2={CX} y2={CY} stroke="#C9A84C" strokeWidth="0.6" strokeOpacity="0.18"/>
              <line x1={W} y1="0" x2={CX} y2={CY} stroke="#C9A84C" strokeWidth="0.6" strokeOpacity="0.18"/>
            </svg>

            {/* Faccia interna del lembo (vista dopo l'apertura) */}
            <svg
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateX(180deg)',
              }}
              viewBox={`0 0 ${W} ${CY + 4}`}
            >
              <defs>
                <linearGradient id="flapBack" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#FFF5E8"/>
                  <stop offset="100%" stopColor="#FFFAF4"/>
                </linearGradient>
              </defs>
              <polygon points={`0,0 ${W},0 ${CX},${CY}`} fill="url(#flapBack)"/>
            </svg>
          </motion.div>

          {/* ── Sigillo in cera ── */}
          <motion.div
            style={{
              position: 'absolute',
              left: '50%', x: '-50%',
              top: CY - 28,    // centrato sulla giuntura del lembo
              zIndex: 20,
              cursor: 'pointer',
            }}
            animate={isOpening
              ? { scale: 0, opacity: 0, rotate: 20 }
              : { scale: 1, opacity: 1, rotate: 0 }
            }
            transition={{ duration: 0.3, ease: [0.4, 0, 1, 1] }}
          >
            <div style={{
              width: 56, height: 56,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 33%, #D9B86A, #A07828 60%, #7A5615)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.28), inset 0 1px 3px rgba(255,255,200,0.25), inset 0 -2px 4px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'Georgia, serif',
                fontWeight: 'bold',
                color: 'rgba(255,255,255,0.92)',
                fontSize: 16,
                letterSpacing: 1,
                textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 6px rgba(0,0,0,0.2)',
              }}>
                MC
              </span>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Suggerimento tocca */}
      <motion.div
        className="flex flex-col items-center gap-1.5"
        animate={{ opacity: isOpening ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.p
          className="text-rose/50 text-sm tracking-widest"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Tocca per aprire
        </motion.p>
        <motion.svg
          width="18" height="11" viewBox="0 0 18 11" fill="none"
          className="text-rose/30"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M1 1L9 9L17 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </motion.div>
    </div>
  )
}
