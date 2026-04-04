import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useCollection, deleteDocument } from '../hooks/useFirestore'
import NavBar from '../components/NavBar'

export default function PatternList() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { docs: patterns, loading } = useCollection(user ? `tailors/${user.uid}/patterns` : null)

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm(t('common.delete_confirm'))) return
    await deleteDocument(`tailors/${user.uid}/patterns`, id)
  }

  return (
    <>
      <div className="page-wide">
        <div className="page-header">
          <h1>{t('patterns.title')}</h1>
          <button className="btn-primary" onClick={() => navigate('/patterns/new')}>
            + {t('patterns.new')}
          </button>
        </div>

        {loading && <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>}

        {!loading && patterns.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📐</div>
            <p>{t('patterns.empty')}</p>
          </div>
        )}

        {patterns.map((p) => (
          <div key={p.id} className="list-item" onClick={() => navigate(`/patterns/${p.id}`)}>
            <div>
              <div className="list-item-title">{p.name}</div>
              <div className="list-item-sub">
                <span className="badge">{t(`patterns.garment_type.${p.garmentType ?? 'both'}`)}</span>
                {' '}
                {(p.measurementFields ?? []).length} {t('patterns.measurements')}
                {' · '}
                {(p.formulaFields ?? []).length} {t('patterns.formulas')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-danger" onClick={(e) => handleDelete(e, p.id)}>{t('patterns.delete')}</button>
              <span style={{ color: 'var(--primary)', fontSize: 20 }}>›</span>
            </div>
          </div>
        ))}
      </div>
      <NavBar />
    </>
  )
}
