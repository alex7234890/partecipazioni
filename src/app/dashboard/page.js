'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const STATUS_LABELS = {
  yes:     { label: 'Confermato',  color: 'bg-green-100 text-green-700 border-green-200' },
  no:      { label: 'Declinato',   color: 'bg-red-100 text-red-700 border-red-200' },
  maybe:   { label: 'Parziale',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
  pending: { label: 'In attesa',   color: 'bg-gray-100 text-gray-500 border-gray-200' },
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Link con copia ────────────────────────────────────────────────────
function CopyLink({ slug, compact = false }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/invite/${slug}`
    : `/invite/${slug}`

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
          copied
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-white border-gold/25 text-gold/70 hover:text-gold hover:border-gold/50'
        }`}
        title={url}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        {copied ? 'Copiato!' : 'Link'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <code className="flex-1 text-xs text-charcoal/50 bg-cream/60 px-2 py-1 rounded truncate">/invite/{slug}</code>
      <button onClick={handleCopy} className={`flex-shrink-0 text-xs px-2 py-1 rounded border transition-colors ${
        copied ? 'bg-green-500 text-white border-green-500' : 'border-gold/30 text-gold/70 hover:bg-gold/5'
      }`}>
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  )
}

// ── Riga singolo componente (usata sia in card che in tabella) ─────────
function MemberLine({ member, showAllergy = true }) {
  const s = member.rsvp_status
  const dot = s === 'yes' ? { bg: 'bg-green-500', icon: '✓' }
            : s === 'no'  ? { bg: 'bg-red-400',   icon: '✗' }
            : { bg: 'bg-gray-300', icon: '?' }

  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full ${dot.bg} text-white flex items-center justify-center`}
        style={{ fontSize: '0.6rem', lineHeight: 1 }}>
        {dot.icon}
      </span>
      <div className="min-w-0">
        <span className={`text-sm ${s === 'no' ? 'text-charcoal/40 line-through' : 'text-charcoal/80'}`}>
          {member.name}
        </span>
        {member.is_child && (
          <span className="ml-1.5 text-xs text-charcoal/35 border border-charcoal/15 px-1.5 rounded-full">bimbo/a</span>
        )}
        {showAllergy && member.allergies && s === 'yes' && (
          <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
            <span>⚠</span>
            <span className="italic">{member.allergies}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Card mobile per singolo invito ────────────────────────────────────
function GuestCard({ guest, onDelete }) {
  const members = guest.guest_members || []
  const yes = members.filter(m => m.rsvp_status === 'yes').length
  const no  = members.filter(m => m.rsvp_status === 'no').length

  return (
    <div className="bg-white rounded-xl border border-gold/15 shadow-sm overflow-hidden">
      {/* Header card */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-charcoal leading-tight">{guest.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_LABELS[guest.rsvp_status]?.color}`}>
              {STATUS_LABELS[guest.rsvp_status]?.label}
            </span>
            {guest.rsvp_status !== 'pending' && members.length > 1 && (
              <span className="text-xs text-charcoal/40">
                {yes > 0 && <span className="text-green-600">{yes} sì</span>}
                {yes > 0 && no > 0 && <span> · </span>}
                {no > 0 && <span className="text-red-400">{no} no</span>}
              </span>
            )}
            {guest.responded_at && (
              <span className="text-xs text-charcoal/35">
                {new Date(guest.responded_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(guest)}
          className="flex-shrink-0 text-red-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>

      {/* Componenti */}
      {members.length > 0 && (
        <div className="px-4 py-2 bg-cream/30 border-t border-gold/10">
          <div className="space-y-0.5">
            {members.map(m => <MemberLine key={m.id} member={m} />)}
          </div>
        </div>
      )}

      {/* Messaggio */}
      {guest.message && (
        <div className="px-4 py-2.5 border-t border-gold/10">
          <p className="text-xs text-charcoal/50 italic">💬 &ldquo;{guest.message}&rdquo;</p>
        </div>
      )}

      {/* Footer: link */}
      <div className="px-4 pb-3 pt-2 border-t border-gold/10">
        <CopyLink slug={guest.slug} />
      </div>
    </div>
  )
}

// ── Mostra link subito dopo aggiunta ──────────────────────────────────
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
        <p className="text-xs font-medium text-green-700">✓ Ospite aggiunto! Ecco il link:</p>
        <button onClick={onClose} className="text-green-400 hover:text-green-600 text-lg leading-none">×</button>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white border border-green-200 rounded-lg px-3 py-2 text-charcoal/70 truncate">{url}</code>
        <button onClick={handleCopy} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
          copied ? 'bg-green-500 text-white' : 'bg-white border border-green-300 text-green-700 hover:bg-green-100'
        }`}>
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
          Elimini <strong>{guest.name}</strong>?
          {guest.rsvp_status !== 'pending' && (
            <span className="block mt-1 text-amber-600">Ha già risposto all&apos;invito.</span>
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

// ── Pagina principale ─────────────────────────────────────────────────
export default function DashboardPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [guests, setGuests]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // form aggiungi
  const [newName, setNewName]           = useState('')
  const [newMembers, setNewMembers]     = useState([{ name: '', is_child: false }])
  const [addingGuest, setAddingGuest]   = useState(false)
  const [newGuestSlug, setNewGuestSlug] = useState(null)

  // elimina
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingId, setDeletingId]     = useState(null)

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

  // form helpers
  const addMemberRow    = () => setNewMembers(p => [...p, { name: '', is_child: false }])
  const removeMemberRow = (i) => setNewMembers(p => p.filter((_, idx) => idx !== i))
  const updateMember    = (i, field, val) =>
    setNewMembers(p => p.map((m, idx) => idx === i ? { ...m, [field]: val } : m))

  const handleAddGuest = async (e) => {
    e.preventDefault()
    const validMembers = newMembers.filter(m => m.name.trim())
    if (validMembers.length === 0) { showToast('Aggiungi almeno un componente', 'error'); return }
    const groupName = newName.trim() || (validMembers.length === 1 ? validMembers[0].name.trim() : '')
    if (!groupName) { showToast('Inserisci il nome del gruppo per più componenti', 'error'); return }

    setAddingGuest(true)
    setNewGuestSlug(null)
    const slug = slugify(groupName)

    const { data: guestData, error: guestError } = await supabase
      .from('guests')
      .insert({ name: groupName, slug, max_guests: validMembers.length })
      .select('id, slug')
      .single()

    if (guestError) {
      showToast(guestError.message.includes('unique') ? 'Slug già esistente, prova un nome diverso' : guestError.message, 'error')
      setAddingGuest(false)
      return
    }

    const { error: membersError } = await supabase
      .from('guest_members')
      .insert(validMembers.map(m => ({ guest_id: guestData.id, name: m.name.trim(), is_child: m.is_child })))

    if (membersError) {
      showToast('Errore inserimento componenti: ' + membersError.message, 'error')
    } else {
      setNewGuestSlug(guestData.slug)
      setNewName('')
      setNewMembers([{ name: '', is_child: false }])
      fetchGuests()
    }
    setAddingGuest(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    const { error } = await supabase.from('guests').delete().eq('id', deleteTarget.id)
    if (error) {
      showToast('Errore: ' + error.message, 'error')
    } else {
      showToast(`"${deleteTarget.name}" eliminato`)
      fetchGuests()
    }
    setDeletingId(null)
    setDeleteTarget(null)
  }

  const handleSendReminders = async () => {
    setReminderLoading(true)
    const pending = guests.filter(g => g.rsvp_status === 'pending')
    if (pending.length === 0) { showToast('Nessun ospite in attesa', 'info'); setReminderLoading(false); return }
    const { error } = await supabase.functions.invoke('send-reminder', { body: { guestIds: pending.map(g => g.id) } })
    if (error) { showToast('Errore: ' + error.message, 'error') }
    else { showToast(`Promemoria inviati a ${pending.length} ospiti`) }
    setReminderLoading(false)
  }

  const handleExportCSV = () => {
    const headers = ['Nome', 'Slug', 'Adulti', 'Bimbi', 'Componenti', 'RSVP', 'Allergie', 'Messaggio', 'Risposto il']
    const rows = guests.map(g => {
      const members = g.guest_members || []
      return [
        g.name, g.slug,
        members.filter(m => !m.is_child).length,
        members.filter(m => m.is_child).length,
        members.map(m => `${m.name}(${m.rsvp_status === 'yes' ? 'SI' : m.rsvp_status === 'no' ? 'NO' : '?'}${m.is_child ? ',B' : ''})`).join(' | '),
        STATUS_LABELS[g.rsvp_status]?.label || g.rsvp_status,
        members.filter(m => m.allergies && m.rsvp_status === 'yes').map(m => `${m.name.split(' ')[0]}: ${m.allergies}`).join('; '),
        g.message || '',
        g.responded_at ? new Date(g.responded_at).toLocaleDateString('it-IT') : '',
      ]
    })
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ospiti-matrimonio.csv'
    a.click()
  }

  const filtered = guests.filter(g => {
    const matchFilter = filter === 'all' || g.rsvp_status === filter
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.slug.includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  // Statistiche
  const allMembers = guests.flatMap(g => g.guest_members || [])
  const counts = {
    pendingInvites:  guests.filter(g => g.rsvp_status === 'pending').length,
    totalAdults:     allMembers.filter(m => !m.is_child).length,
    totalChildren:   allMembers.filter(m => m.is_child).length,
    yesAdults:       allMembers.filter(m => !m.is_child && m.rsvp_status === 'yes').length,
    yesChildren:     allMembers.filter(m => m.is_child  && m.rsvp_status === 'yes').length,
    noAdults:        allMembers.filter(m => !m.is_child && m.rsvp_status === 'no').length,
    noChildren:      allMembers.filter(m => m.is_child  && m.rsvp_status === 'no').length,
    pendingAdults:   allMembers.filter(m => !m.is_child && m.rsvp_status === 'pending').length,
    pendingChildren: allMembers.filter(m => m.is_child  && m.rsvp_status === 'pending').length,
  }

  // Helper per cards maybe
  const guestMap = Object.fromEntries(guests.map(g => [g.id, g]))
  const maybeAdults   = allMembers.filter(m => !m.is_child && guestMap[m.guest_id]?.rsvp_status === 'maybe').length
  const maybeChildren = allMembers.filter(m => m.is_child  && guestMap[m.guest_id]?.rsvp_status === 'maybe').length

  const statCards = [
    { label: 'Totale',        color: 'border-gray-200',   a: counts.totalAdults,   c: counts.totalChildren,   n: guests.length },
    { label: 'Confermati',    color: 'border-green-200',  a: counts.yesAdults,     c: counts.yesChildren,     n: guests.filter(g=>g.rsvp_status==='yes').length },
    { label: 'Declinati',     color: 'border-red-200',    a: counts.noAdults,      c: counts.noChildren,      n: guests.filter(g=>g.rsvp_status==='no').length },
    { label: 'Parziali',      color: 'border-amber-200',  a: maybeAdults,          c: maybeChildren,          n: guests.filter(g=>g.rsvp_status==='maybe').length },
    { label: 'In attesa',     color: 'border-gray-200',   a: counts.pendingAdults, c: counts.pendingChildren, n: counts.pendingInvites },
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
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500 text-white' :
          toast.type === 'info'  ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gold/20 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="font-playfair text-xl sm:text-2xl text-gold">Dashboard Sposi</h1>
          <p className="text-charcoal/50 text-xs mt-0.5">Matteo e Clio</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAddForm(v => !v); setNewGuestSlug(null) }}
            className="bg-gold text-white px-3 py-2 rounded-lg text-sm hover:bg-gold/90 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            <span className="hidden sm:inline">Aggiungi</span>
          </button>
          <button onClick={handleLogout} className="text-sm text-charcoal/50 hover:text-charcoal border border-gray-200 px-3 py-2 rounded-lg transition-colors">
            Esci
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Statistiche */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-2">
          {statCards.map(c => (
            <div key={c.label} className={`bg-white rounded-xl border ${c.color} p-3 sm:p-4 text-center shadow-sm`}>
              <div className="font-playfair text-2xl sm:text-3xl text-gold">{c.a + c.c}</div>
              <div className="text-xs font-medium text-charcoal/70 mt-0.5">{c.label}</div>
              <div className="text-xs text-charcoal/40 mt-1">
                {c.a > 0 && <span>👨 {c.a}</span>}
                {c.a > 0 && c.c > 0 && <span> · </span>}
                {c.c > 0 && <span>👶 {c.c}</span>}
                {c.a === 0 && c.c === 0 && <span>—</span>}
              </div>
              <div className="text-xs text-charcoal/30">{c.n} inv.</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-charcoal/35 mb-5 text-right">👨 adulti · 👶 bimbi</p>

        {/* Azioni secondarie */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-gold/25 text-gold/80 px-3 py-2 rounded-lg text-xs hover:bg-gold/5 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            CSV
          </button>
          <button onClick={handleSendReminders} disabled={reminderLoading}
            className="flex items-center gap-1.5 bg-white border border-rose/25 text-rose/80 px-3 py-2 rounded-lg text-xs hover:bg-rose/5 transition-colors disabled:opacity-60">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {reminderLoading ? 'Invio…' : `Promemoria (${counts.pendingInvites})`}
          </button>
        </div>

        {/* ── Form aggiungi ─────────────────────────────────────────── */}
        {showAddForm && (
          <div className="bg-white rounded-xl border border-gold/20 p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-playfair text-gold">Aggiungi invito</h2>
              <button onClick={() => setShowAddForm(false)} className="text-charcoal/30 hover:text-charcoal text-xl leading-none">×</button>
            </div>
            <p className="text-xs text-charcoal/40 mb-4">Persona singola o nucleo — aggiungi tutti i componenti.</p>
            <form onSubmit={handleAddGuest}>
              <div className="mb-4">
                <label className="text-xs text-charcoal/50 block mb-1.5">
                  Nome invito
                  {newMembers.filter(m => m.name.trim()).length === 1 && !newName.trim() && (
                    <span className="ml-1 text-charcoal/30">(opzionale per persona singola)</span>
                  )}
                  {newMembers.filter(m => m.name.trim()).length > 1 && !newName.trim() && (
                    <span className="ml-1 text-amber-500">(obbligatorio per più persone)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNewGuestSlug(null) }}
                  placeholder="es. Mario Rossi  o  Famiglia Rossi"
                  className="w-full border border-gold/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-cream/40"
                />
                {(newName.trim() || newMembers.filter(m=>m.name.trim()).length===1) && !newGuestSlug && (
                  <p className="text-xs text-charcoal/30 mt-1">
                    Slug: <span className="font-mono text-gold/50">{slugify(newName.trim() || newMembers.filter(m=>m.name.trim())[0]?.name || '')}</span>
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="text-xs text-charcoal/50 block mb-2">Componenti</label>
                <div className="flex flex-col gap-2">
                  {newMembers.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m.name}
                        onChange={e => updateMember(i, 'name', e.target.value)}
                        placeholder="Nome e Cognome"
                        className="flex-1 border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-cream/40"
                      />
                      <button
                        type="button"
                        onClick={() => updateMember(i, 'is_child', !m.is_child)}
                        className={`flex-shrink-0 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                          m.is_child ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                      >
                        {m.is_child ? '👶 Bimbo/a' : '👨 Adulto'}
                      </button>
                      {newMembers.length > 1 && (
                        <button type="button" onClick={() => removeMemberRow(i)} className="text-red-300 hover:text-red-500 text-lg leading-none px-1">×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addMemberRow} className="mt-2 text-xs text-gold/60 hover:text-gold transition-colors flex items-center gap-1">
                  <span className="text-base leading-none">+</span> Aggiungi componente
                </button>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={addingGuest}
                  className="bg-gold text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gold/90 transition-colors disabled:opacity-60">
                  {addingGuest ? '…' : 'Aggiungi invito'}
                </button>
              </div>
            </form>

            {newGuestSlug && <LinkBox slug={newGuestSlug} onClose={() => setNewGuestSlug(null)} />}
          </div>
        )}

        {/* Filtri + ricerca */}
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per nome…"
            className="w-full border border-gold/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {['all', 'yes', 'no', 'maybe', 'pending'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filter === f ? 'bg-gold text-white border-gold' : 'bg-white border-gray-200 text-charcoal/60 hover:border-gold/30'
                }`}
              >
                {f === 'all' ? `Tutti (${guests.length})` : `${STATUS_LABELS[f]?.label} (${guests.filter(g=>g.rsvp_status===f).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Lista ospiti ──────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-12 text-charcoal/40">Caricamento…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-charcoal/40">Nessun ospite trovato</div>
        ) : (
          <>
            {/* MOBILE: cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {filtered.map(g => (
                <GuestCard key={g.id} guest={g} onDelete={setDeleteTarget} />
              ))}
            </div>

            {/* DESKTOP: tabella */}
            <div className="hidden sm:block bg-white rounded-xl border border-gold/20 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream/50 border-b border-gold/10">
                    <th className="text-left px-4 py-3 font-medium text-charcoal/55 text-xs">Invitato</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/55 text-xs">Componenti e presenza</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/55 text-xs hidden md:table-cell">Messaggio</th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/55 text-xs">Link</th>
                    <th className="px-3 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(g => {
                    const members = g.guest_members || []
                    return (
                      <tr key={g.id} className="border-b border-gray-50 hover:bg-cream/20 transition-colors align-top">
                        {/* Nome + stato + data */}
                        <td className="px-4 py-3 min-w-[140px]">
                          <p className="font-medium text-charcoal text-sm leading-tight">{g.name}</p>
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_LABELS[g.rsvp_status]?.color}`}>
                            {STATUS_LABELS[g.rsvp_status]?.label}
                          </span>
                          {g.responded_at && (
                            <p className="text-xs text-charcoal/35 mt-1">
                              {new Date(g.responded_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                            </p>
                          )}
                        </td>

                        {/* Componenti con stato individuale */}
                        <td className="px-4 py-3 min-w-[220px]">
                          {members.length === 0 ? (
                            <span className="text-xs text-charcoal/30">—</span>
                          ) : (
                            <div className="space-y-0.5">
                              {members.map(m => <MemberLine key={m.id} member={m} />)}
                            </div>
                          )}
                        </td>

                        {/* Messaggio */}
                        <td className="px-4 py-3 text-xs text-charcoal/50 italic max-w-[200px] hidden md:table-cell">
                          {g.message ? `"${g.message}"` : <span className="text-charcoal/25 not-italic">—</span>}
                        </td>

                        {/* Link copia */}
                        <td className="px-4 py-3">
                          <CopyLink slug={g.slug} compact />
                        </td>

                        {/* Elimina */}
                        <td className="px-3 py-3">
                          <button onClick={() => setDeleteTarget(g)}
                            className="text-red-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
