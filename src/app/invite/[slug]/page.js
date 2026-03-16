'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import EnvelopeAnimation from '@/components/EnvelopeAnimation'
import WeddingCard from '@/components/WeddingCard'
import Countdown from '@/components/Countdown'
import Timeline from '@/components/Timeline'
import LocationCard from '@/components/LocationCard'
import GiftList from '@/components/GiftList'
import RSVPForm from '@/components/RSVPForm'
import FlowerDecoration from '@/components/FlowerDecoration'
import { motion } from 'framer-motion'

export default function InvitePage() {
  const { slug } = useParams()
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [envelopeOpened, setEnvelopeOpened] = useState(false)

  useEffect(() => {
    if (!slug) return
    const fetchGuest = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setGuest(data)
      }
      setLoading(false)
    }
    fetchGuest()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
          <p className="font-playfair text-gold/70 tracking-widest">Caricamento…</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">💌</div>
          <h1 className="font-playfair text-2xl text-gold mb-3">Invito non trovato</h1>
          <p className="text-charcoal/60">
            Il link potrebbe essere errato o scaduto. Contatta gli sposi per ricevere il tuo link personale.
          </p>
        </div>
      </div>
    )
  }

  if (!envelopeOpened) {
    return <EnvelopeAnimation onOpen={() => setEnvelopeOpened(true)} />
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Sezione 2: Cartoncino con foto */}
      <WeddingCard guestName={guest?.name} />

      {/* Divider */}
      <Divider />

      {/* Sezione 3: Countdown */}
      <Countdown />

      <Divider />

      {/* Sezione 4: Timeline */}
      <Timeline />

      <Divider />

      {/* Sezione 5: Location */}
      <LocationCard />

      <Divider />

      {/* Sezione 6: Lista nozze */}
      <GiftList />

      <Divider />

      {/* Sezione 7-8: RSVP + Conferma */}
      <RSVPForm guest={guest} />

      {/* Footer */}
      <footer className="py-8 text-center relative overflow-hidden">
        <FlowerDecoration position="bottom-left" className="opacity-30" />
        <FlowerDecoration position="bottom-right" className="opacity-30" />
        <p className="font-playfair text-gold/60 text-sm tracking-widest">
          Matteo &amp; Clio · {new Date(WEDDING_DATE).getFullYear()}
        </p>
      </footer>
    </main>
  )
}

// Helper: usa la data dal config senza importarlo (è in config/wedding.js)
const WEDDING_DATE = '2025-09-20'

function Divider() {
  return (
    <div className="flex items-center justify-center py-2 px-8">
      <div className="flex-1 h-px bg-gold/15" />
      <div className="mx-4 text-gold/40 text-xl">✦</div>
      <div className="flex-1 h-px bg-gold/15" />
    </div>
  )
}
