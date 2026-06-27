import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, BookOpen, Users, List } from 'lucide-react'
import api from '../lib/api'

type Book = {
  _id: string
  title: string
  author: string
  isbn: string
  category: string
  quantity: number
  availableQuantity: number
}

type Member = {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

type BorrowRecord = {
  _id: string
  borrowDate: string
  returnDate: string | null
  status: 'borrowed' | 'returned'
  bookId: { title: string; author: string; isbn: string }
  memberId: { name: string; email: string }
}

export default function ManagePage() {
  const [tab, setTab] = useState<'books' | 'members' | 'loans'>('books')

  const tabs = [
    { key: 'books', label: 'Books', icon: <BookOpen size={15} /> },
    { key: 'members', label: 'Members', icon: <Users size={15} /> },
    { key: 'loans', label: 'All Loans', icon: <List size={15} /> },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', marginBottom: 4 }}>Manage Library</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Add or remove books, manage members, and track all loans.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '2px solid #e5e7eb', paddingBottom: 0 }}>
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 20px',
              border: 'none',
              cursor: 'pointer',
              background: 'none',
              fontSize: 14,
              fontWeight: tab === key ? 700 : 400,
              color: tab === key ? '#1a3a5c' : '#6b7280',
              borderBottom: tab === key ? '2px solid #1a3a5c' : '2px solid transparent',
              marginBottom: -2,
              transition: 'all 0.15s',
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === 'books' && <BooksPanel />}
      {tab === 'members' && <MembersPanel />}
      {tab === 'loans' && <LoansPanel />}
    </div>
  )
}

/* ─── Books Panel ─────────────────────────────────────────────── */

function BooksPanel() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)

  const q = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: () => api.get('/books').then((r) => r.data.books),
  })

  const upsert = useMutation({
    mutationFn: (data: any) =>
      editing ? api.put(`/books/${editing._id}`, data) : api.post('/books', data),
    onSuccess: () => {
      toast.success(editing ? 'Book updated successfully!' : 'Book added successfully!')
      qc.invalidateQueries({ queryKey: ['books'] })
      setShowForm(false)
      setEditing(null)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error saving book'),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/books/${id}`),
    onSuccess: () => {
      toast.success('Book deleted')
      qc.invalidateQueries({ queryKey: ['books'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error deleting book'),
  })

  function openAdd() { setEditing(null); setShowForm(true) }
  function openEdit(b: Book) { setEditing(b); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null) }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const qty = Number(fd.get('quantity'))
    if (qty < 0) { toast.error('Quantity cannot be negative'); return }
    upsert.mutate({
      title: fd.get('title'),
      author: fd.get('author'),
      isbn: fd.get('isbn'),
      category: fd.get('category') || '',
      quantity: qty,
    })
  }

  const inp: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 7,
    border: '1.5px solid #d1d5db',
    background: '#f9fafb',
    fontSize: 14,
    color: '#111',
    outline: 'none',
  }
  const lbl: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 5,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, color: '#6b7280' }}>
          {q.data ? <><strong style={{ color: '#111' }}>{q.data.length}</strong> books in catalog</> : 'Loading…'}
        </span>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #1a3a5c, #2d6a9f)',
            color: '#fff',
            border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            boxShadow: '0 2px 6px rgba(26,58,92,0.3)',
          }}
        >
          <Plus size={16} /> Add New Book
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: '#fff',
            border: '1.5px solid #bfdbfe',
            borderRadius: 10,
            padding: 22,
            boxShadow: '0 4px 16px rgba(26,58,92,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1a3a5c' }}>
              {editing ? '✏️ Edit Book' : '➕ Add New Book'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={lbl}>Title *</label>
              <input name="title" required defaultValue={editing?.title} style={inp} placeholder="Book title" />
            </div>
            <div>
              <label style={lbl}>Author *</label>
              <input name="author" required defaultValue={editing?.author} style={inp} placeholder="Author name" />
            </div>
            <div>
              <label style={lbl}>ISBN *</label>
              <input name="isbn" required defaultValue={editing?.isbn} style={inp} placeholder="e.g. 978-0-06-112008-4" />
            </div>
            <div>
              <label style={lbl}>Category</label>
              <input name="category" defaultValue={editing?.category} style={inp} placeholder="e.g. Programming, Fiction" />
            </div>
            <div>
              <label style={lbl}>Total Quantity *</label>
              <input name="quantity" type="number" min={0} required defaultValue={editing?.quantity ?? 1} style={inp} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button
                type="submit"
                disabled={upsert.isPending}
                style={{
                  flex: 1, padding: '10px',
                  background: 'linear-gradient(135deg, #1a3a5c, #2d6a9f)',
                  color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                {upsert.isPending ? 'Saving…' : editing ? 'Update Book' : 'Add Book'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14, color: '#374151' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {q.isLoading && <p style={{ color: '#6b7280', padding: '20px 0' }}>Loading books…</p>}

      {!q.isLoading && q.data?.length === 0 && (
        <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: 48, textAlign: 'center', color: '#9ca3af' }}>
          <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: 15, color: '#6b7280', marginBottom: 6 }}>No books yet</p>
          <p style={{ fontSize: 13 }}>Click "Add New Book" above to add your first book to the catalog.</p>
        </div>
      )}

      {q.data && q.data.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                {['Title', 'Author', 'ISBN', 'Category', 'Available / Total', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.data.map((b, i) => (
                <tr key={b._id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '13px 14px', fontWeight: 600, color: '#111' }}>{b.title}</td>
                  <td style={{ padding: '13px 14px', color: '#6b7280' }}>{b.author}</td>
                  <td style={{ padding: '13px 14px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{b.isbn}</td>
                  <td style={{ padding: '13px 14px' }}>
                    {b.category
                      ? <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{b.category}</span>
                      : <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ fontWeight: 700, color: b.availableQuantity === 0 ? '#dc2626' : '#16a34a', fontSize: 14 }}>
                      {b.availableQuantity}
                    </span>
                    <span style={{ color: '#9ca3af' }}> / {b.quantity}</span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => openEdit(b)}
                        title="Edit book"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 5, cursor: 'pointer', color: '#1d4ed8', fontSize: 12, fontWeight: 500 }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`Delete "${b.title}"? This cannot be undone.`)) del.mutate(b._id) }}
                        title="Delete book"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 5, cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 500 }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Members Panel ───────────────────────────────────────────── */

function MembersPanel() {
  const qc = useQueryClient()

  const q = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => api.get('/members').then((r) => r.data.members),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/members/${id}`),
    onSuccess: () => {
      toast.success('Member deleted')
      qc.invalidateQueries({ queryKey: ['members'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error deleting member'),
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 14, color: '#6b7280' }}>
        {q.data ? <><strong style={{ color: '#111' }}>{q.data.length}</strong> registered members</> : 'Loading…'}
      </div>

      {q.isLoading && <p style={{ color: '#6b7280' }}>Loading members…</p>}

      {!q.isLoading && q.data?.length === 0 && (
        <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: 48, textAlign: 'center', color: '#9ca3af' }}>
          <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: 15, color: '#6b7280', marginBottom: 6 }}>No members yet</p>
          <p style={{ fontSize: 13 }}>Members will appear here after they register on the sign-up page.</p>
        </div>
      )}

      {q.data && q.data.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                {['#', 'Name', 'Email', 'Role', 'Registered On', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.data.map((m, i) => (
                <tr key={m._id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '13px 14px', color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '13px 14px', fontWeight: 600, color: '#111' }}>{m.name}</td>
                  <td style={{ padding: '13px 14px', color: '#6b7280' }}>{m.email}</td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                      {m.role}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px', color: '#6b7280' }}>
                    {new Date(m.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <button
                      onClick={() => { if (window.confirm(`Delete member "${m.name}"? This cannot be undone.`)) del.mutate(m._id) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 5, cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 500 }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Loans Panel ─────────────────────────────────────────────── */

function LoansPanel() {
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'returned'>('all')

  const q = useQuery<BorrowRecord[]>({
    queryKey: ['all-borrows'],
    queryFn: () => api.get('/members/all-borrows').then((r) => r.data.records),
  })

  const filtered = (q.data ?? []).filter((r) => filter === 'all' || r.status === filter)
  const borrowedCount = q.data?.filter(r => r.status === 'borrowed').length ?? 0
  const returnedCount = q.data?.filter(r => r.status === 'returned').length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary */}
      {q.data && (
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', fontSize: 13 }}>
            Total: <strong>{q.data.length}</strong>
          </div>
          <div style={{ background: '#fff2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#dc2626' }}>
            Active: <strong>{borrowedCount}</strong>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#16a34a' }}>
            Returned: <strong>{returnedCount}</strong>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Filter:</span>
        {(['all', 'borrowed', 'returned'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: filter === f ? 'none' : '1px solid #e5e7eb',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: filter === f
                ? f === 'borrowed' ? '#dc2626' : f === 'returned' ? '#16a34a' : '#1a3a5c'
                : '#fff',
              color: filter === f ? '#fff' : '#6b7280',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {q.isLoading && <p style={{ color: '#6b7280' }}>Loading loan records…</p>}

      {!q.isLoading && filtered.length === 0 && (
        <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          <List size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: 15, color: '#6b7280', marginBottom: 4 }}>No loan records found</p>
          <p style={{ fontSize: 13 }}>
            {filter === 'all' ? 'No books have been borrowed yet.' : `No ${filter} loans found.`}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                {['Member', 'Book', 'ISBN', 'Borrowed On', 'Returned On', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row._id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#111' }}>{row.memberId?.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{row.memberId?.email}</div>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#111' }}>{row.bookId?.title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{row.bookId?.author}</div>
                  </td>
                  <td style={{ padding: '13px 14px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{row.bookId?.isbn}</td>
                  <td style={{ padding: '13px 14px', color: '#6b7280' }}>
                    {new Date(row.borrowDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '13px 14px', color: row.returnDate ? '#16a34a' : '#9ca3af' }}>
                    {row.returnDate
                      ? new Date(row.returnDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: row.status === 'borrowed' ? '#fef2f2' : '#f0fdf4',
                        color: row.status === 'borrowed' ? '#dc2626' : '#16a34a',
                        border: row.status === 'borrowed' ? '1px solid #fecaca' : '1px solid #bbf7d0',
                      }}
                    >
                      {row.status === 'borrowed' ? '● Active' : '✓ Returned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
