import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, BookOpen, Filter } from 'lucide-react'
import api from '../lib/api'
import { getUser } from '../lib/auth'

export default function DashboardPage() {
  const user = getUser()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const booksQ = useQuery({
    queryKey: ['books'],
    queryFn: () => api.get('/books').then((r) => r.data.books),
  })

  const myBorrowsQ = useQuery({
    queryKey: ['my-active-borrows'],
    enabled: user?.role === 'member',
    queryFn: async () => {
      const res = await api.get('/members/me/books')
      return new Set<string>(
        res.data.records
          .filter((b: any) => b.status === 'borrowed')
          .map((b: any) => b.bookId?._id)
      )
    },
  })

  const borrow = useMutation({
    mutationFn: (id: string) => api.post(`/books/${id}/borrow`),
    onSuccess: () => {
      toast.success('Book borrowed successfully!')
      qc.invalidateQueries({ queryKey: ['books'] })
      qc.invalidateQueries({ queryKey: ['my-active-borrows'] })
      qc.invalidateQueries({ queryKey: ['my-borrows'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to borrow book'),
  })

  const categories = useMemo(() => {
    const set = new Set<string>()
    booksQ.data?.forEach((b: any) => b.category && set.add(b.category))
    return Array.from(set).sort()
  }, [booksQ.data])

  const filtered = useMemo(() => {
    if (!booksQ.data) return []
    const q = search.toLowerCase()
    return booksQ.data.filter(
      (b: any) =>
        (!category || b.category === category) &&
        (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q))
    )
  }, [booksQ.data, search, category])

  const totalBooks = booksQ.data?.length ?? 0
  const availableBooks = booksQ.data?.filter((b: any) => b.availableQuantity > 0).length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', marginBottom: 4 }}>Books Catalog</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            Browse and search the library collection.
            {user?.role === 'member' && ' Click "Borrow" to borrow a book.'}
            {user?.role === 'librarian' && ' Go to Manage to add or edit books.'}
          </p>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 12 }}>
          <StatCard label="Total Books" value={totalBooks} color="#1a3a5c" />
          <StatCard label="Available" value={availableBooks} color="#16a34a" />
        </div>
      </div>

      {/* Search + Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: '12px 16px',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}
          />
          <input
            style={{
              width: '100%',
              padding: '9px 12px 9px 35px',
              borderRadius: 7,
              border: '1.5px solid #e5e7eb',
              background: '#f9fafb',
              fontSize: 14,
              outline: 'none',
              color: '#111',
            }}
            placeholder="Search by title, author or ISBN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="#6b7280" />
          <select
            style={{
              padding: '9px 12px',
              borderRadius: 7,
              border: '1.5px solid #e5e7eb',
              background: '#f9fafb',
              fontSize: 14,
              cursor: 'pointer',
              color: '#374151',
              outline: 'none',
            }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {(search || category) && (
          <button
            onClick={() => { setSearch(''); setCategory('') }}
            style={{ padding: '9px 14px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Loading */}
      {booksQ.isLoading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
          <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>Loading books…</p>
        </div>
      )}

      {/* Error */}
      {booksQ.isError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, color: '#dc2626', fontSize: 14 }}>
          ⚠️ Failed to load books. Please check your connection and refresh.
        </div>
      )}

      {/* Results count */}
      {!booksQ.isLoading && booksQ.data && (
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          Showing <strong style={{ color: '#111' }}>{filtered.length}</strong> of <strong style={{ color: '#111' }}>{totalBooks}</strong> books
          {(search || category) && ' (filtered)'}
        </div>
      )}

      {/* Empty state */}
      {!booksQ.isLoading && !booksQ.isError && filtered.length === 0 && (
        <div
          style={{
            border: '2px dashed #e5e7eb',
            borderRadius: 12,
            padding: 56,
            textAlign: 'center',
            color: '#9ca3af',
          }}
        >
          <BookOpen size={40} style={{ margin: '0 auto 14px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: '#6b7280' }}>
            {search || category ? 'No books match your search' : 'No books in the catalog yet'}
          </p>
          <p style={{ fontSize: 13 }}>
            {search || category
              ? 'Try different keywords or clear your filters.'
              : user?.role === 'librarian'
              ? 'Go to Manage → Books to add your first book.'
              : 'Check back later when books are added by the librarian.'}
          </p>
          {(search || category) && (
            <button
              onClick={() => { setSearch(''); setCategory('') }}
              style={{ marginTop: 16, padding: '8px 18px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Book grid */}
      {filtered.length > 0 && (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtered.map((book: any) => {
            const alreadyBorrowed = myBorrowsQ.data?.has(book._id)
            const unavailable = book.availableQuantity <= 0
            return (
              <div
                key={book._id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* Category badge */}
                {book.category && (
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      marginBottom: 10,
                    }}
                  >
                    {book.category}
                  </span>
                )}

                <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, color: '#111', marginBottom: 4 }}>{book.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>by {book.author}</p>

                <div
                  style={{
                    background: '#f9fafb',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: 12,
                    color: '#6b7280',
                    marginBottom: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div>ISBN: <span style={{ color: '#374151', fontFamily: 'monospace' }}>{book.isbn}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Available:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: unavailable ? '#dc2626' : '#16a34a',
                        fontSize: 13,
                      }}
                    >
                      {book.availableQuantity}
                    </span>
                    <span>/ {book.quantity} copies</span>
                  </div>
                </div>

                {/* Availability bar */}
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${book.quantity > 0 ? (book.availableQuantity / book.quantity) * 100 : 0}%`,
                      background: unavailable ? '#dc2626' : '#16a34a',
                      borderRadius: 4,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>

                {/* Borrow button (members only) */}
                {user?.role === 'member' && (
                  <button
                    disabled={unavailable || !!alreadyBorrowed || borrow.isPending}
                    onClick={() => borrow.mutate(book._id)}
                    style={{
                      marginTop: 'auto',
                      padding: '9px',
                      background: alreadyBorrowed
                        ? '#d1fae5'
                        : unavailable
                        ? '#f3f4f6'
                        : 'linear-gradient(135deg, #1a3a5c, #2d6a9f)',
                      color: alreadyBorrowed ? '#065f46' : unavailable ? '#9ca3af' : '#fff',
                      border: alreadyBorrowed ? '1px solid #a7f3d0' : 'none',
                      borderRadius: 7,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: unavailable || !!alreadyBorrowed ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {alreadyBorrowed ? '✓ Already Borrowed' : unavailable ? 'Currently Unavailable' : 'Borrow Book'}
                  </button>
                )}

                {/* Librarian view — no borrow button */}
                {user?.role === 'librarian' && (
                  <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 4 }}>
                    Manage books in the Manage tab
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '10px 16px',
        textAlign: 'center',
        minWidth: 90,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</div>
    </div>
  )
}
