'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const STATUS_LABELS = {
  yes: { label: 'Confermato', color: 'bg-green-100 text-green-700 border-green-200' },
  no: { label: 'Declinato', color: 'bg-red-100 text-red-700 border-red-200' },
  maybe: { label: 'Forse', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  pending: { label: 'In attesa', color: 'bg-gray-100 text-gray-600 border-gray-200' },
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function DashboardPage() {
  const router = useRouter()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [addingGuest, setAddingGuest] = useState(false)
  const [reminderLoading, setReminderLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchGuests = useCallback(async () => {
    const { data } = await supabase.from('guests').select('*').order('created_at', { ascending: false })
    setGuests(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleAddGuest = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setAddingGuest(true)
    const slug = slugify(newName.trim())
    const { error } = await supabase.from('guests').insert({ name: newName.trim(), slug })
    if (error) {
      showToast(error.message.includes('unique') ? 'Slug già esistente, prova un nome diverso' : error.message, 'error')
    } else {
      setNewName('')
      fetchGuests()
      showToast(`Ospite "${newName.trim()}" aggiunto. Link: /invite/${slug}`)
    }
    setAddingGuest(false)
  }

  const handleSendReminders = async () => {
    setReminderLoading(true)
    const pending = guests.filter((g) => g.rsvp_status === 'pending')
    if (pending.length === 0) {
      showToast('Nessun ospite in attesa di risposta', 'info')
      setReminderLoading(false)
      return
    }
    const { error } = await supabase.functions.invoke('send-reminder', {
      body: { guestIds: pending.map((g) => g.id) },
    })
    if (error) {
      showToast('Errore invio promemoria: ' + error.message, 'error')
    } else {
      showToast(`Promemoria inviati a ${pending.length} ospiti`)
    }
    setReminderLoading(false)
  }

  const handleExportCSV = () => {
    const headers = ['Nome', 'Slug', 'RSVP', 'Allergie', 'Messaggio', 'Risposto il', 'Creato il']
    const rows = guests.map((g) => [
      g.name,
      g.slug,
      STATUS_LABELS[g.rsvp_status]?.label || g.rsvp_status,
      g.allergies || '',
      g.message || '',
      g.responded_at ? new Date(g.responded_at).toLocaleDateString('it-IT') : '',
      new Date(g.created_at).toLocaleDateString('it-IT'),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ospiti-matrimonio.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = guests.filter((g) => {
    const matchFilter = filter === 'all' || g.rsvp_status === filter
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.slug.includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    total: guests.length,
    yes: guests.filter((g) => g.rsvp_status === 'yes').length,
    no: guests.filter((g) => g.rsvp_status === 'no').length,
    maybe: guests.filter((g) => g.rsvp_status === 'maybe').length,
    pending: guests.filter((g) => g.rsvp_status === 'pending').length,
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500 text-white' :
          toast.type === 'info' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gold/20 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-xl sm:text-2xl text-gold">Dashboard Sposi</h1>
          <p className="text-charcoal/50 text-xs mt-0.5">Matteo &amp; Clio — Gestione ospiti</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-charcoal/50 hover:text-charcoal transition-colors border border-gray-200 px-3 py-1.5 rounded-lg"
        >
          Esci
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Contatori */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Totale', value: counts.total, color: 'border-gray-200' },
            { label: 'Confermati', value: counts.yes, color: 'border-green-200' },
            { label: 'Declinati', value: counts.no, color: 'border-red-200' },
            { label: 'Forse', value: counts.maybe, color: 'border-amber-200' },
            { label: 'In attesa', value: counts.pending, color: 'border-gray-200' },
          ].map((c) => (
            <div key={c.label} className={`bg-white rounded-xl border ${c.color} p-4 text-center shadow-sm`}>
              <div className="font-playfair text-2xl text-gold">{c.value}</div>
              <div className="text-xs text-charcoal/60 mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Azioni */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-gold/30 text-gold px-4 py-2 rounded-lg text-sm hover:bg-gold/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Esporta CSV
          </button>
          <button
            onClick={handleSendReminders}
            disabled={reminderLoading}
            className="flex items-center gap-2 bg-white border border-rose/30 text-rose px-4 py-2 rounded-lg text-sm hover:bg-rose/5 transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {reminderLoading ? 'Invio…' : `Promemoria in attesa (${counts.pending})`}
          </button>
        </div>

        {/* Aggiungi ospite */}
        <form onSubmit={handleAddGuest} className="bg-white rounded-xl border border-gold/20 p-5 mb-6 shadow-sm">
          <h2 className="font-playfair text-gold mb-3">Aggiungi ospite</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome e cognome ospite"
              className="flex-1 border border-gold/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-cream/40"
            />
            <button
              type="submit"
              disabled={addingGuest || !newName.trim()}
              className="bg-gold text-white px-5 py-2 rounded-lg text-sm hover:bg-gold/90 transition-colors disabled:opacity-60"
            >
              {addingGuest ? '…' : 'Aggiungi'}
            </button>
          </div>
          {newName.trim() && (
            <p className="text-xs text-charcoal/50 mt-2">
              Link generato: <span className="font-mono text-gold">/invite/{slugify(newName.trim())}</span>
            </p>
          )}
        </form>

        {/* Filtri + ricerca */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome o slug…"
            className="flex-1 border border-gold/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {['all', 'yes', 'no', 'maybe', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filter === f
                    ? 'bg-gold text-white border-gold'
                    : 'bg-white border-gray-200 text-charcoal/60 hover:border-gold/30'
                }`}
              >
                {f === 'all' ? 'Tutti' : STATUS_LABELS[f]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabella */}
        {loading ? (
          <div className="text-center py-12 text-charcoal/40">Caricamento…</div>
        ) : (
          <div className="bg-white rounded-xl border border-gold/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream/60 border-b border-gold/10">
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">Slug / Link</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">RSVP</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60 hidden sm:table-cell">Allergie</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60 hidden md:table-cell">Messaggio</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60 hidden lg:table-cell">Risposto</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-charcoal/40">
                        Nessun ospite trovato
                      </td>
                    </tr>
                  ) : (
                    filtered.map((g) => (
                      <tr key={g.id} className="border-b border-gray-50 hover:bg-cream/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-charcoal">{g.name}</td>
                        <td className="px-4 py-3">
                          <code className="text-xs text-gold/80 bg-gold/5 px-2 py-0.5 rounded">
                            {g.slug}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block border text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[g.rsvp_status]?.color}`}>
                            {STATUS_LABELS[g.rsvp_status]?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-charcoal/60 hidden sm:table-cell max-w-[160px] truncate">
                          {g.allergies || '—'}
                        </td>
                        <td className="px-4 py-3 text-charcoal/60 hidden md:table-cell max-w-[200px] truncate">
                          {g.message || '—'}
                        </td>
                        <td className="px-4 py-3 text-charcoal/50 text-xs hidden lg:table-cell">
                          {g.responded_at
                            ? new Date(g.responded_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
