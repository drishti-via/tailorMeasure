import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useCollection } from '../hooks/useFirestore'
import NavBar from '../components/NavBar'

export default function ClientList() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { docs: clients, loading } = useCollection(user ? `tailors/${user.uid}/clients` : null)
  const [search, setSearch] = useState('')

  const filtered = clients.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <>
      <div className="page-wide">
        <div className="page-header">
          <h1>{t('clients.title')}</h1>
          <button className="btn-primary" onClick={() => navigate('/clients/new')}>
            + {t('clients.new')}
          </button>
        </div>

        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('clients.search')}
          style={{ marginBottom: 16 }}
        />

        {loading && <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>}

        {!loading && filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
            <p>{search ? 'No results' : t('clients.empty')}</p>
          </div>
        )}

        {filtered.map((c) => (
          <div key={c.id} className="list-item" onClick={() => navigate(`/clients/${c.id}`)}>
            <div>
              <div className="list-item-title">{c.name}</div>
              <div className="list-item-sub">📱 {c.phone}</div>
            </div>
            <span style={{ color: 'var(--primary)', fontSize: 20 }}>›</span>
          </div>
        ))}
      </div>
      <NavBar />
    </>
  )
}
