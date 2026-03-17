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

const WEDDING_YEAR = '2026'

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
      if (error || !data) setNotFound(true)
      else setGuest(data)
      setLoading(false)
    }
    fetchGuest()
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid rgba(139,150,64,0.3)',
            borderTopColor: '#8B9640',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p className="font-playfair" style={{ color: 'rgba(139,150,64,0.6)', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
            Caricamento
          </p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2', padding: '1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ width: 40, height: 1, background: 'rgba(139,150,64,0.3)', margin: '0 auto 24px' }}/>
          <h1 className="font-playfair" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#2C2420', marginBottom: 12 }}>
            Invito non trovato
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(44,36,32,0.45)', lineHeight: 1.7 }}>
            Il link potrebbe essere errato o scaduto.<br/>
            Contatta gli sposi per ricevere il tuo link personale.
          </p>
        </div>
      </div>
    )
  }

  if (!envelopeOpened) {
    return <EnvelopeAnimation onOpen={() => setEnvelopeOpened(true)} />
  }

  return (
    <main style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      <WeddingCard guestName={guest?.name} />
      <Divider />
      <Countdown />
      <Divider />
      <Timeline />
      <Divider />
      <LocationCard />
      <Divider />
      <GiftList />
      <Divider />
      <RSVPForm guest={guest} />

      {/* Footer */}
      <footer style={{ padding: '48px 0 40px', textAlign: 'center', borderTop: '1px solid rgba(139,150,64,0.1)' }}>
        <p className="font-playfair" style={{ color: 'rgba(44,36,32,0.35)', fontSize: '0.8rem', letterSpacing: '0.2em', fontWeight: 400 }}>
          Matteo &amp; Clio · {WEDDING_YEAR}
        </p>
      </footer>
    </main>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 2rem' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(139,150,64,0.12)' }}/>
      <svg style={{ margin: '0 16px', flexShrink: 0 }} width="8" height="8" viewBox="0 0 8 8">
        <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#8B9640" fillOpacity="0.35"/>
      </svg>
      <div style={{ flex: 1, height: 1, background: 'rgba(139,150,64,0.12)' }}/>
    </div>
  )
}
