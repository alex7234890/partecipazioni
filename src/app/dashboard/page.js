'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
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

function LinkBox({ slug, onClose }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/invite/${slug}`
    : `/invite/${slug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-green-700">✓ Ospite aggiunto! Ecco il link da inviare:</p>
        <button onClick={onClose} className="text-green-400 hover:text-green-600 text-lg leading-none">×</button>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white border border-green-200 rounded-lg px-3 py-2 text-charcoal/70 truncate">
          {url}
        </code>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-white border border-green-300 text-green-700 hover:bg-green-100'
          }`}
        >
          {copied ? '✓ Copiato!' : 'Copia'}
        </button>
      </div>
    </div>
  )
}

function DeleteConfirm({ guest, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <h3 className="font-playfair text-lg text-charcoal mb-2">Elimina ospite</h3>
        <p className="text-charcoal/60 text-sm mb-5">
          Sei sicuro di voler eliminare <strong>{guest.name}</strong>?
          {guest.rsvp_status !== 'pending' && (
            <span className="block mt-1 text-amber-600">
              Attenzione: ha già risposto all&apos;invito.
            </span>
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-charcoal/70 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {loading ? 'Eliminazione…' : 'Elimina'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  // form aggiungi ospite
  const [newName, setNewName] = useState('')
  const [newMaxGuests, setNewMaxGuests] = useState(1)
  const [addingGuest, setAddingGuest] = useState(false)
  const [newGuestSlug, setNewGuestSlug] = useState(null)
  // elimina
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  // altri
  const [reminderLoading, setReminderLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchGuests = useCallback(async () => {
    const { data } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })
    setGuests(data || [])
    setLoading(false)
  }, [supabase])

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
    setNewGuestSlug(null)
    const slug = slugify(newName.trim())
    const { error } = await supabase
      .from('guests')
      .insert({ name: newName.trim(), slug, max_guests: newMaxGuests })
    if (error) {
      showToast(
        error.message.includes('unique')
          ? 'Slug già esistente, prova un nome diverso'
          : error.message,
        'error'
      )
    } else {
      setNewGuestSlug(slug)
      setNewName('')
      setNewMaxGuests(1)
      fetchGuests()
    }
    setAddingGuest(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', deleteTarget.id)
    if (error) {
      showToast('Errore eliminazione: ' + error.message, 'error')
    } else {
      showToast(`"${deleteTarget.name}" eliminato`)
      fetchGuests()
    }
    setDeletingId(null)
    setDeleteTarget(null)
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
    const headers = ['Nome', 'Slug', 'Persone', 'RSVP', 'Allergie', 'Messaggio', 'Risposto il', 'Creato il']
    const rows = guests.map((g) => [
      g.name,
      g.slug,
      g.max_guests,
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
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.includes(search.toLowerCase())
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
      {/* Modale conferma eliminazione */}
      {deleteTarget && (
        <DeleteConfirm
          guest={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={!!deletingId}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
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
        <div className="bg-white rounded-xl border border-gold/20 p-5 mb-6 shadow-sm">
          <h2 className="font-playfair text-gold mb-4">Aggiungi ospite</h2>
          <form onSubmit={handleAddGuest}>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Nome */}
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNewGuestSlug(null) }}
                placeholder="Nome (es. Famiglia Rossi)"
                className="flex-1 border border-gold/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-cream/40"
              />
              {/* Numero persone */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-xs text-charcoal/50 whitespace-nowrap">N° persone</label>
                <div className="flex items-center border border-gold/20 rounded-lg overflow-hidden bg-cream/40">
                  <button
                    type="button"
                    onClick={() => setNewMaxGuests((n) => Math.max(1, n - 1))}
                    className="px-3 py-2.5 text-gold hover:bg-gold/10 transition-colors text-lg leading-none font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-charcoal">
                    {newMaxGuests}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewMaxGuests((n) => Math.min(20, n + 1))}
                    className="px-3 py-2.5 text-gold hover:bg-gold/10 transition-colors text-lg leading-none font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Submit */}
              <button
                type="submit"
                disabled={addingGuest || !newName.trim()}
                className="bg-gold text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gold/90 transition-colors disabled:opacity-60 flex-shrink-0"
              >
                {addingGuest ? '…' : 'Aggiungi'}
              </button>
            </div>

            {/* Anteprima slug */}
            {newName.trim() && !newGuestSlug && (
              <p className="text-xs text-charcoal/40 mt-2">
                Slug: <span className="font-mono text-gold/70">{slugify(newName.trim())}</span>
                {newMaxGuests > 1 && (
                  <span className="ml-2 text-charcoal/40">· invito per {newMaxGuests} persone</span>
                )}
              </p>
            )}
          </form>

          {/* Link generato dopo aggiunta */}
          {newGuestSlug && (
            <LinkBox slug={newGuestSlug} onClose={() => setNewGuestSlug(null)} />
          )}
        </div>

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
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">Link invito</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">Persone</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">RSVP</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60 hidden sm:table-cell">Allergie</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60 hidden md:table-cell">Messaggio</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60 hidden lg:table-cell">Risposto</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-charcoal/40">
                        Nessun ospite trovato
                      </td>
                    </tr>
                  ) : (
                    filtered.map((g) => (
                      <tr key={g.id} className="border-b border-gray-50 hover:bg-cream/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-charcoal">{g.name}</td>
                        <td className="px-4 py-3">
                          <GuestLinkCell slug={g.slug} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-charcoal/70 text-xs">
                            👥 {g.max_guests}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block border text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[g.rsvp_status]?.color}`}>
                            {STATUS_LABELS[g.rsvp_status]?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-charcoal/60 hidden sm:table-cell max-w-[140px] truncate">
                          {g.allergies || '—'}
                        </td>
                        <td className="px-4 py-3 text-charcoal/60 hidden md:table-cell max-w-[180px] truncate">
                          {g.message || '—'}
                        </td>
                        <td className="px-4 py-3 text-charcoal/50 text-xs hidden lg:table-cell whitespace-nowrap">
                          {g.responded_at
                            ? new Date(g.responded_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDeleteTarget(g)}
                            className="text-red-300 hover:text-red-500 transition-colors p-1 rounded"
                            title="Elimina ospite"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
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

// Cella link con copia inline
function GuestLinkCell({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/invite/${slug}`
    : `/invite/${slug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1.5 max-w-[200px]">
      <code className="text-xs text-gold/70 truncate">/invite/{slug}</code>
      <button
        onClick={handleCopy}
        className={`flex-shrink-0 text-xs px-2 py-0.5 rounded transition-colors ${
          copied
            ? 'text-green-600 bg-green-50'
            : 'text-charcoal/40 hover:text-gold hover:bg-gold/5'
        }`}
        title="Copia link"
      >
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  )
}
