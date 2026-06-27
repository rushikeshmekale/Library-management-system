import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { BookOpen, RotateCcw, CheckCircle2 } from 'lucide-react'
import api from '../lib/api'

export default function MyBooksPage() {
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['my-borrows'],
    queryFn: () => api.get('/members/me/books').then((r) => r.data.records),
  })

  const ret = useMutation({
    mutationFn: (bookId: string) => api.post(`/books/${bookId}/return`),
    onSuccess: () => {
      toast.success('Book returned successfully!')
      qc.invalidateQueries({ queryKey: ['my-borrows'] })
      qc.invalidateQueries({ queryKey: ['my-active-borrows'] })
      qc.invalidateQueries({ queryKey: ['books'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to return book'),
  })

  const active = q.data?.filter((r: any) => r.status === 'borrowed') ?? []
  const history = q.data?.filter((r: any) => r.status === 'returned') ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', marginBottom: 4 }}>My Books</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Track your current borrowings and borrow history.</p>
      </div>

      {/* Loading */}
      {q.isLoading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
          <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>Loading your books…</p>
        </div>
      )}

      {/* Error */}
      {q.isError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, color: '#dc2626', fontSize: 14 }}>
          ⚠️ Failed to load your books. Please refresh the page.
        </div>
      )}

      {/* Summary cards */}
      {!q.isLoading && q.data && (
        <div style={{ display: 'flex', gap: 14 }}>
          <SummaryCard icon="📖" label="Currently Borrowed" value={active.length} color="#1a3a5c" />
          <SummaryCard icon="✅" label="Total Returned" value={history.length} color="#16a34a" />
          <SummaryCard icon="📚" label="Total Borrows" value={q.data.length} color="#7c3aed" />
        </div>
      )}

      {/* Currently borrowed */}
      {!q.isLoading && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} color="#1a3a5c" />
            Currently Borrowed
            {active.length > 0 && (
              <span style={{ background: '#1a3a5c', color: '#fff', fontSize: 12, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                {active.length}
              </span>
            )}
          </h2>

          {active.length === 0 ? (
            <div
              style={{
                border: '2px dashed #e5e7eb',
                borderRadius: 10,
                padding: 40,
                textAlign: 'center',
                color: '#9ca3af',
              }}
            >
              <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
              <p style={{ fontWeight: 600, fontSize: 15, color: '#6b7280', marginBottom: 4 }}>No books currently borrowed</p>
              <p style={{ fontSize: 13 }}>Go to the <strong>Books Catalog</strong> to borrow a book.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {active.map((row: any) => (
                <div
                  key={row._id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderLeft: '4px solid #1a3a5c',
                    borderRadius: 8,
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 3 }}>
                      {row.bookId?.title}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      by {row.bookId?.author}
                      {row.bookId?.category && (
                        <span style={{ marginLeft: 8, background: '#eff6ff', color: '#1d4ed8', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          {row.bookId.category}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 5 }}>
                      📅 Borrowed on {new Date(row.borrowDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <button
                    onClick={() => ret.mutate(row.bookId._id)}
                    disabled={ret.isPending}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      background: ret.isPending ? '#f3f4f6' : '#fff',
                      border: '1.5px solid #d1d5db',
                      borderRadius: 7,
                      cursor: ret.isPending ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#374151',
                      flexShrink: 0,
                    }}
                  >
                    <RotateCcw size={14} />
                    Return Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* History */}
      {!q.isLoading && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} color="#16a34a" />
            Return History
            {history.length > 0 && (
              <span style={{ background: '#16a34a', color: '#fff', fontSize: 12, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                {history.length}
              </span>
            )}
          </h2>

          {history.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 14, padding: '16px 0' }}>
              No return history yet.
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    {['Book Title', 'Author', 'ISBN', 'Borrowed On', 'Returned On'].map((h) => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((row: any, i: number) => (
                    <tr key={row._id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#111' }}>{row.bookId?.title}</td>
                      <td style={{ padding: '12px 14px', color: '#6b7280' }}>{row.bookId?.author}</td>
                      <td style={{ padding: '12px 14px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{row.bookId?.isbn}</td>
                      <td style={{ padding: '12px 14px', color: '#6b7280' }}>
                        {new Date(row.borrowDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 500 }}>
                        {row.returnDate
                          ? new Date(row.returnDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}
