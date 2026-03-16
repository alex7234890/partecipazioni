'use client'

import { useEffect, useRef } from 'react'

const INITIALS = 'M & C'

// ── Seeded LCG pseudo-random (deterministic) ──────────────────────────
function makeLCG(seed) {
  let s = seed
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

// ── Irregular circle using quadratic bezier through midpoints ─────────
function irregularPoints(cx, cy, r, n = 14, jitterAmp = 0.055) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const angle   = (i / n) * Math.PI * 2 - Math.PI / 2
    const jitter  = 1 + Math.sin(i * 2.31 + 1.07) * jitterAmp
    pts.push({ x: cx + r * jitter * Math.cos(angle), y: cy + r * jitter * Math.sin(angle) })
  }
  return pts
}

function tracePath(ctx, pts) {
  const n = pts.length
  ctx.beginPath()
  ctx.moveTo((pts[0].x + pts[n - 1].x) / 2, (pts[0].y + pts[n - 1].y) / 2)
  for (let i = 0; i < n; i++) {
    const nx = (i + 1) % n
    ctx.quadraticCurveTo(pts[i].x, pts[i].y,
      (pts[i].x + pts[nx].x) / 2, (pts[i].y + pts[nx].y) / 2)
  }
  ctx.closePath()
}

// ── Main draw routine ─────────────────────────────────────────────────
function drawSeal(ctx, S) {
  const cx = S / 2, cy = S / 2
  const r  = S * 0.40      // main seal radius (80 px on 200×200)

  const sealPts  = irregularPoints(cx, cy, r,        14, 0.052)
  const bleedPts = irregularPoints(cx, cy, r * 1.13, 12, 0.085)

  // ── A · Wax bleed & drips ──────────────────────────────────────────
  ctx.save()
  ctx.filter = 'blur(10px)'
  tracePath(ctx, bleedPts)
  ctx.fillStyle = 'rgba(176,122,62,0.40)'
  ctx.fill()
  ctx.restore()

  // Wax drip blobs at 4 irregular edge points
  ;[{ a: 0.88, s: 0.13 }, { a: 2.55, s: 0.10 }, { a: 4.05, s: 0.12 }, { a: 5.60, s: 0.09 }]
    .forEach(({ a, s }) => {
      const dx = cx + r * 1.06 * Math.cos(a)
      const dy = cy + r * 1.06 * Math.sin(a)
      ctx.save()
      ctx.filter = 'blur(6px)'
      const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, r * s * 1.6)
      g.addColorStop(0, 'rgba(176,122,62,0.52)')
      g.addColorStop(1, 'rgba(176,122,62,0.00)')
      ctx.beginPath()
      ctx.arc(dx, dy, r * s * 1.7, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
      ctx.restore()
    })

  // ── B · Drop shadow ───────────────────────────────────────────────
  ctx.save()
  ctx.shadowColor   = 'rgba(70,32,8,0.48)'
  ctx.shadowBlur    = 16
  ctx.shadowOffsetY = 7
  tracePath(ctx, sealPts)
  ctx.fillStyle = '#b08050'
  ctx.fill()
  ctx.restore()

  // ── B · Wax radial gradient (amber-gold, not shiny) ──────────────
  const mainGrad = ctx.createRadialGradient(
    cx - r * 0.30, cy - r * 0.30, r * 0.03,
    cx + r * 0.10, cy + r * 0.10, r * 1.05)
  mainGrad.addColorStop(0.00, '#f2e0c6')  // top-left highlight
  mainGrad.addColorStop(0.18, '#e0c09a')
  mainGrad.addColorStop(0.40, '#c8966c')
  mainGrad.addColorStop(0.65, '#a06830')
  mainGrad.addColorStop(0.85, '#7e5020')
  mainGrad.addColorStop(1.00, '#5e3a10')  // deep shadow edge
  tracePath(ctx, sealPts)
  ctx.fillStyle = mainGrad
  ctx.fill()

  // Inner highlight — top-left radial glow
  tracePath(ctx, sealPts)
  ctx.save()
  ctx.clip()
  const hlGrad = ctx.createRadialGradient(
    cx - r * 0.34, cy - r * 0.34, 0,
    cx - r * 0.15, cy - r * 0.15, r * 0.62)
  hlGrad.addColorStop(0, 'rgba(255,252,240,0.48)')
  hlGrad.addColorStop(1, 'rgba(255,252,240,0.00)')
  ctx.fillStyle = hlGrad
  ctx.fillRect(0, 0, S, S)
  ctx.restore()

  // Inner shadow — bottom-right
  tracePath(ctx, sealPts)
  ctx.save()
  ctx.clip()
  const shGrad = ctx.createRadialGradient(
    cx + r * 0.20, cy + r * 0.20, r * 0.20,
    cx + r * 0.35, cy + r * 0.35, r * 0.90)
  shGrad.addColorStop(0, 'rgba(50,20,4,0.00)')
  shGrad.addColorStop(1, 'rgba(50,20,4,0.45)')
  ctx.fillStyle = shGrad
  ctx.fillRect(0, 0, S, S)
  ctx.restore()

  // ── C · Embossed concentric rim ───────────────────────────────────
  // Upper-right arc = dark (recessed top)
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.87, -Math.PI * 0.78, Math.PI * 0.52)
  ctx.strokeStyle = 'rgba(62,32,8,0.42)'
  ctx.lineWidth   = 3
  ctx.stroke()
  // Lower-left arc = light (raised bottom)
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.87, Math.PI * 0.52, -Math.PI * 0.78)
  ctx.strokeStyle = 'rgba(248,218,172,0.38)'
  ctx.lineWidth   = 3
  ctx.stroke()
  ctx.restore()

  // ── D · Monogram — engraved effect ───────────────────────────────
  const fontSize = Math.round(r * 0.60)
  ctx.save()
  ctx.font         = `italic ${fontSize}px 'Playfair Display', Georgia, serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'

  // Engraved depth: dark shadow offset down-right
  ctx.shadowColor   = 'rgba(28,10,2,0.72)'
  ctx.shadowBlur    = 2.5
  ctx.shadowOffsetX = 1.6
  ctx.shadowOffsetY = 1.8
  ctx.fillStyle     = 'rgba(48,22,5,0.92)'
  ctx.fillText(INITIALS, cx, cy)

  // Engraved highlight: pale offset up-left
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0
  ctx.fillStyle   = 'rgba(255,245,220,0.22)'
  ctx.fillText(INITIALS, cx - 1.0, cy - 1.0)
  ctx.restore()

  // ── E · Light reflection streak ───────────────────────────────────
  tracePath(ctx, sealPts)
  ctx.save()
  ctx.clip()
  ctx.translate(cx - r * 0.10, cy - r * 0.16)
  ctx.rotate(-0.62)   // ~35°
  ctx.filter = 'blur(5px)'
  const refGrad = ctx.createLinearGradient(-r * 0.42, 0, r * 0.42, 0)
  refGrad.addColorStop(0.0, 'rgba(255,252,240,0.00)')
  refGrad.addColorStop(0.3, 'rgba(255,252,240,0.20)')
  refGrad.addColorStop(0.5, 'rgba(255,252,240,0.26)')
  refGrad.addColorStop(0.7, 'rgba(255,252,240,0.20)')
  refGrad.addColorStop(1.0, 'rgba(255,252,240,0.00)')
  ctx.fillStyle = refGrad
  ctx.fillRect(-r * 0.42, -r * 0.24, r * 0.84, r * 0.48)
  ctx.restore()

  // ── F · Wax grain / surface noise ────────────────────────────────
  tracePath(ctx, sealPts)
  ctx.save()
  ctx.clip()
  const rng = makeLCG(9721)
  for (let i = 0; i < 600; i++) {
    const angle = rng() * Math.PI * 2
    const rad   = Math.sqrt(rng()) * r   // sqrt for uniform distribution
    const px    = cx + rad * Math.cos(angle)
    const py    = cy + rad * Math.sin(angle)
    const sz    = 0.35 + rng() * 0.95
    const al    = 0.022 + rng() * 0.07
    ctx.beginPath()
    ctx.arc(px, py, sz, 0, Math.PI * 2)
    ctx.fillStyle = rng() > 0.46
      ? `rgba(255,248,230,${al * 0.55})`
      : `rgba(30,12,3,${al})`
    ctx.fill()
  }
  ctx.restore()
}

// ── React component ───────────────────────────────────────────────────
export default function WaxSeal({ size = 200 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width        = size * dpr
    canvas.height       = size * dpr
    canvas.style.width  = `${size}px`
    canvas.style.height = `${size}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    // Wait for Playfair Display to load before drawing text
    document.fonts.ready.then(() => drawSeal(ctx, size))
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', borderRadius: '50%' }}
    />
  )
}
