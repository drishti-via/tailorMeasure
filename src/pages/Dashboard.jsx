import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useCollection } from '../hooks/useFirestore'
import NavBar from '../components/NavBar'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { docs: patterns } = useCollection(user ? `tailors/${user.uid}/patterns` : null)
  const { docs: clients } = useCollection(user ? `tailors/${user.uid}/clients` : null)

  const recent = [...clients].slice(-5).reverse()

  return (
    <>
      <div className="page-wide">
        {/* Header */}
        <div style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{t('dashboard.greeting')} 🙏</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>✂️ TailorMeasure</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/clients')}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>{clients.length}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('dashboard.clients')}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/patterns')}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>{patterns.length}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('dashboard.patterns')}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <button
            className="btn-primary"
            style={{ width: '100%', padding: 14, fontSize: 15, textAlign: 'left' }}
            onClick={() => navigate('/clients/new')}
          >
            👤 {t('dashboard.add_client')}
          </button>
          <button
            className="btn-outline"
            style={{ width: '100%', padding: 14, fontSize: 15, textAlign: 'left' }}
            onClick={() => navigate('/patterns/new')}
          >
            📐 {t('dashboard.new_pattern')}
          </button>
        </div>

        {/* Recent clients */}
        {recent.length > 0 && (
          <>
            <h2 style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 10 }}>{t('dashboard.recent_clients')}</h2>
            {recent.map((c) => (
              <div key={c.id} className="list-item" onClick={() => navigate(`/clients/${c.id}`)}>
                <div>
                  <div className="list-item-title">{c.name}</div>
                  <div className="list-item-sub">📱 {c.phone}</div>
                </div>
                <span style={{ color: 'var(--primary)', fontSize: 20 }}>›</span>
              </div>
            ))}
          </>
        )}
      </div>
      <NavBar />
    </>
  )
}
