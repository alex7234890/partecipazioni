'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const STATUS_LABELS = {
  yes:     { label: 'Confermato',  color: 'bg-green-100 text-green-700 border-green-200' },
  no:      { label: 'Declinato',   color: 'bg-red-100 text-red-700 border-red-200' },
  maybe:   { label: 'Parziale',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
  pending: { label: 'In attesa',   color: 'bg-gray-100 text-gray-600 border-gray-200' },
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Mostra link dopo aggiunta ─────────────────────────────────────────
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

// ── Modale elimina ────────────────────────────────────────────────────
function DeleteConfirm({ guest, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <h3 className="font-playfair text-lg text-charcoal mb-2">Elimina ospite</h3>
        <p className="text-charcoal/60 text-sm mb-5">
          Sei sicuro di voler eliminare <strong>{guest.name}</strong>?
          {guest.rsvp_status !== 'pending' && (
            <span className="block mt-1 text-amber-600">Attenzione: ha già risposto all&apos;invito.</span>
          )}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-charcoal/70 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Annulla
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-60">
            {loading ? 'Eliminazione…' : 'Elimina'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Cella link con copia ──────────────────────────────────────────────
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
          copied ? 'text-green-600 bg-green-50' : 'text-charcoal/40 hover:text-gold hover:bg-gold/5'
        }`}
        title="Copia link"
      >
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  )
}

// ── Cella componenti ──────────────────────────────────────────────────
function MembersCell({ members }) {
  if (!members || members.length === 0) return <span className="text-charcoal/30 text-xs">—</span>
  const adults   = members.filter(m => !m.is_child)
  const children = members.filter(m => m.is_child)
  return (
    <div>
      <div className="text-xs text-charcoal/45 mb-0.5">
        {adults.length > 0 && <span>👨 {adults.length}</span>}
        {adults.length > 0 && children.length > 0 && <span className="mx-1">·</span>}
        {children.length > 0 && <span>👶 {children.length}</span>}
      </div>
      <div className="text-xs text-charcoal/65 max-w-[160px] truncate">
        {members.map(m => m.is_child ? `${m.name} (bimbo/a)` : m.name).join(', ')}
      </div>
    </div>
  )
}

// ── Cella RSVP con dettaglio per-persona ──────────────────────────────
function RsvpCell({ guest }) {
  const members = guest.guest_members || []
  const yes     = members.filter(m => m.rsvp_status === 'yes').length
  const no      = members.filter(m => m.rsvp_status === 'no').length
  const pending = members.filter(m => m.rsvp_status === 'pending').length

  return (
    <div>
      <span className={`inline-block border text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[guest.rsvp_status]?.color}`}>
        {STATUS_LABELS[guest.rsvp_status]?.label}
      </span>
      {members.length > 0 && guest.rsvp_status !== 'pending' && (
        <div className="text-xs mt-0.5" style={{ color: 'rgba(44,36,32,0.4)' }}>
          {yes > 0 && <span style={{ color: '#4caf50' }}>{yes}✓ </span>}
          {no > 0 && <span style={{ color: '#c0392b' }}>{no}✗ </span>}
          {pending > 0 && <span>{pending}?</span>}
        </div>
      )}
    </div>
  )
}

// ── Cella allergie aggregate ──────────────────────────────────────────
function AllergiesCell({ members }) {
  if (!members || members.length === 0) return <span className="text-charcoal/30">—</span>
  const withAllergies = members.filter(m => m.allergies && m.rsvp_status === 'yes')
  if (withAllergies.length === 0) return <span className="text-charcoal/30">—</span>
  return (
    <span className="text-xs text-charcoal/60">
      {withAllergies.map(m => `${m.name.split(' ')[0]}: ${m.allergies}`).join(' · ')}
    </span>
  )
}

// ── Pagina principale ─────────────────────────────────────────────────
export default function DashboardPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [guests, setGuests]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  // form aggiungi ospite
  const [newName, setNewName]         = useState('')
  const [newMembers, setNewMembers]   = useState([{ name: '', is_child: false }])
  const [addingGuest, setAddingGuest] = useState(false)
  const [newGuestSlug, setNewGuestSlug] = useState(null)

  // elimina
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingId, setDeletingId]     = useState(null)

  // altri
  const [reminderLoading, setReminderLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchGuests = useCallback(async () => {
    const { data } = await supabase
      .from('guests')
      .select('*, guest_members(*)')
      .order('created_at', { ascending: false })
    setGuests(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchGuests() }, [fetchGuests])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ── Helpers form membri ─────────────────────────────────────────────
  const addMemberRow    = () => setNewMembers(prev => [...prev, { name: '', is_child: false }])
  const removeMemberRow = (i) => setNewMembers(prev => prev.filter((_, idx) => idx !== i))
  const updateMember    = (i, field, value) =>
    setNewMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))

  // ── Aggiungi ospite ─────────────────────────────────────────────────
  const handleAddGuest = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const validMembers = newMembers.filter(m => m.name.trim())
    if (validMembers.length === 0) { showToast('Aggiungi almeno un componente', 'error'); return }

    setAddingGuest(true)
    setNewGuestSlug(null)
    const slug = slugify(newName.trim())

    const { data: guestData, error: guestError } = await supabase
      .from('guests')
      .insert({ name: newName.trim(), slug, max_guests: validMembers.length })
      .select('id, slug')
      .single()

    if (guestError) {
      showToast(
        guestError.message.includes('unique')
          ? 'Slug già esistente, prova un nome diverso'
          : guestError.message,
        'error'
      )
      setAddingGuest(false)
      return
    }

    const { error: membersError } = await supabase
      .from('guest_members')
      .insert(validMembers.map(m => ({
        guest_id: guestData.id,
        name: m.name.trim(),
        is_child: m.is_child,
      })))

    if (membersError) {
      showToast('Errore nell\'inserimento dei componenti: ' + membersError.message, 'error')
    } else {
      setNewGuestSlug(guestData.slug)
      setNewName('')
      setNewMembers([{ name: '', is_child: false }])
      fetchGuests()
    }
    setAddingGuest(false)
  }

  // ── Elimina ospite ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    const { error } = await supabase.from('guests').delete().eq('id', deleteTarget.id)
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
    const headers = ['Nome', 'Slug', 'Adulti', 'Bimbi', 'Componenti', 'RSVP', 'Allergie', 'Messaggio', 'Risposto il']
    const rows = guests.map((g) => {
      const members  = g.guest_members || []
      const adults   = members.filter(m => !m.is_child).length
      const children = members.filter(m => m.is_child).length
      const memberNames = members.map(m => m.is_child ? `${m.name}(B)` : m.name).join(' | ')
      const allergies = members.filter(m => m.allergies).map(m => `${m.name.split(' ')[0]}: ${m.allergies}`).join('; ')
      return [
        g.name, g.slug, adults, children, memberNames,
        STATUS_LABELS[g.rsvp_status]?.label || g.rsvp_status,
        allergies,
        g.message || '',
        g.responded_at ? new Date(g.responded_at).toLocaleDateString('it-IT') : '',
      ]
    })
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'ospiti-matrimonio.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Filtro e ricerca ────────────────────────────────────────────────
  const filtered = guests.filter((g) => {
    const matchFilter = filter === 'all' || g.rsvp_status === filter
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  // ── Statistiche da guest_members ────────────────────────────────────
  const allMembers = guests.flatMap(g => g.guest_members || [])
  const counts = {
    totalInvites:  guests.length,
    totalAdults:   allMembers.filter(m => !m.is_child).length,
    totalChildren: allMembers.filter(m => m.is_child).length,
    yesAdults:     allMembers.filter(m => !m.is_child && m.rsvp_status === 'yes').length,
    yesChildren:   allMembers.filter(m => m.is_child  && m.rsvp_status === 'yes').length,
    noAdults:      allMembers.filter(m => !m.is_child && m.rsvp_status === 'no').length,
    noChildren:    allMembers.filter(m => m.is_child  && m.rsvp_status === 'no').length,
    maybeAdults:   allMembers.filter(m => !m.is_child && m.rsvp_status === 'pending' && guests.find(g => g.id === m.guest_id)?.rsvp_status === 'maybe').length,
    pendingInvites: guests.filter(g => g.rsvp_status === 'pending').length,
    pendingAdults:  allMembers.filter(m => !m.is_child && m.rsvp_status === 'pending').length,
    pendingChildren:allMembers.filter(m => m.is_child  && m.rsvp_status === 'pending').length,
  }

  const statCards = [
    {
      label: 'Totale', color: 'border-gray-200',
      adults: counts.totalAdults, children: counts.totalChildren,
      invites: counts.totalInvites,
    },
    {
      label: 'Confermati', color: 'border-green-200',
      adults: counts.yesAdults, children: counts.yesChildren,
      invites: guests.filter(g => g.rsvp_status === 'yes').length,
    },
    {
      label: 'Declinati', color: 'border-red-200',
      adults: counts.noAdults, children: counts.noChildren,
      invites: guests.filter(g => g.rsvp_status === 'no').length,
    },
    {
      label: 'Parziali/Forse', color: 'border-amber-200',
      adults: allMembers.filter(m => !m.is_child && guests.find(g => g.id === m.guest_id)?.rsvp_status === 'maybe').length,
      children: allMembers.filter(m => m.is_child && guests.find(g => g.id === m.guest_id)?.rsvp_status === 'maybe').length,
      invites: guests.filter(g => g.rsvp_status === 'maybe').length,
    },
    {
      label: 'In attesa', color: 'border-gray-200',
      adults: counts.pendingAdults, children: counts.pendingChildren,
      invites: counts.pendingInvites,
    },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {deleteTarget && (
        <DeleteConfirm
          guest={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={!!deletingId}
        />
      )}

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white' :
          toast.type === 'info'  ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
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

        {/* Statistiche */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
          {statCards.map((c) => (
            <div key={c.label} className={`bg-white rounded-xl border ${c.color} p-4 text-center shadow-sm`}>
              <div className="font-playfair text-2xl text-gold">
                {c.adults + c.children}
              </div>
              <div className="text-xs font-medium text-charcoal/70 mt-0.5">{c.label}</div>
              <div className="text-xs text-charcoal/40 mt-1 leading-relaxed">
                {c.adults > 0 && <span>👨 {c.adults}</span>}
                {c.adults > 0 && c.children > 0 && <span> · </span>}
                {c.children > 0 && <span>👶 {c.children}</span>}
                {c.adults === 0 && c.children === 0 && <span>—</span>}
              </div>
              <div className="text-xs text-charcoal/30 mt-0.5">
                {c.invites} {c.invites === 1 ? 'invito' : 'inviti'}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-charcoal/40 mb-6 text-right">
          Il numero grande = persone totali (👨 adulti · 👶 bimbi)
        </p>

        {/* Azioni */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-gold/30 text-gold px-4 py-2 rounded-lg text-sm hover:bg-gold/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Esporta CSV
          </button>
          <button
            onClick={handleSendReminders}
            disabled={reminderLoading}
            className="flex items-center gap-2 bg-white border border-rose/30 text-rose px-4 py-2 rounded-lg text-sm hover:bg-rose/5 transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {reminderLoading ? 'Invio…' : `Promemoria (${counts.pendingInvites} in attesa)`}
          </button>
        </div>

        {/* ── Form aggiungi ospite ──────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gold/20 p-5 mb-6 shadow-sm">
          <h2 className="font-playfair text-gold mb-4">Aggiungi invito / nucleo familiare</h2>
          <form onSubmit={handleAddGuest}>
            {/* Nome gruppo */}
            <div className="mb-4">
              <label className="text-xs text-charcoal/50 block mb-1.5">Nome gruppo (es. Famiglia Rossi)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNewGuestSlug(null) }}
                placeholder="Famiglia Rossi"
                className="w-full border border-gold/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-cream/40"
              />
              {newName.trim() && !newGuestSlug && (
                <p className="text-xs text-charcoal/35 mt-1">
                  Slug: <span className="font-mono text-gold/60">{slugify(newName.trim())}</span>
                </p>
              )}
            </div>

            {/* Lista componenti */}
            <div className="mb-4">
              <label className="text-xs text-charcoal/50 block mb-2">Componenti del nucleo</label>
              <div className="flex flex-col gap-2">
                {newMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateMember(i, 'name', e.target.value)}
                      placeholder="Nome e Cognome (es. Francesco Rossi)"
                      className="flex-1 border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-cream/40"
                    />
                    <button
                      type="button"
                      onClick={() => updateMember(i, 'is_child', !m.is_child)}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                        m.is_child
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}
                    >
                      {m.is_child ? '👶 Bimbo/a' : '👨 Adulto'}
                    </button>
                    {newMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMemberRow(i)}
                        className="text-red-300 hover:text-red-500 transition-colors text-lg leading-none px-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMemberRow}
                className="mt-2 text-xs text-gold/70 hover:text-gold transition-colors flex items-center gap-1"
              >
                <span className="text-base leading-none">+</span> Aggiungi componente
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addingGuest || !newName.trim()}
                className="bg-gold text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gold/90 transition-colors disabled:opacity-60"
              >
                {addingGuest ? '…' : 'Aggiungi invito'}
              </button>
            </div>
          </form>

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

        {/* Tabella ospiti */}
        {loading ? (
          <div className="text-center py-12 text-charcoal/40">Caricamento…</div>
        ) : (
          <div className="bg-white rounded-xl border border-gold/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream/60 border-b border-gold/10">
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">Nome gruppo</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">Link invito</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/60">Componenti</th>
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
                        <td className="px-4 py-3">
                          <MembersCell members={g.guest_members} />
                        </td>
                        <td className="px-4 py-3">
                          <RsvpCell guest={g} />
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell max-w-[160px]">
                          <AllergiesCell members={g.guest_members} />
                        </td>
                        <td className="px-4 py-3 text-charcoal/60 hidden md:table-cell max-w-[180px] truncate text-xs">
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
