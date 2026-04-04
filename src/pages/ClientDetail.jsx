import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useCollection } from '../hooks/useFirestore'
import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'

export default function ClientDetail() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'tailors', user.uid, 'clients', id)).then((snap) => {
      if (snap.exists()) setClient({ id: snap.id, ...snap.data() })
    })
  }, [user, id])

  const sets = client?.measurementSets ?? []

  return (
    <>
      <div className="page-wide">
        <div className="page-header">
          <button className="btn-ghost" onClick={() => navigate('/clients')}>← Back</button>
          <h1 style={{ fontSize: 18 }}>{client?.name ?? '...'}</h1>
          <div />
        </div>

        {client && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{client.name}</div>
            <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>📱 {client.phone}</div>
          </div>
        )}

        <div className="page-header" style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 16 }}>{t('clients.measurement_sets')}</h2>
          <button className="btn-primary" onClick={() => navigate(`/clients/${id}/measure`)}>
            + {t('clients.new_measurement')}
          </button>
        </div>

        {sets.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
            <p>{t('clients.no_measurements')}</p>
          </div>
        )}

        {[...sets].reverse().map((s, i) => (
          <div key={i} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>{s.patternName}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(s.values ?? {}).map(([k, v]) => (
                <span key={k} style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <NavBar />
    </>
  )
}
