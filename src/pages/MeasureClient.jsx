import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { evaluate } from 'mathjs'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useCollection } from '../hooks/useFirestore'
import NavBar from '../components/NavBar'

function computeResults(formulaFields, measurementFields, values) {
  return formulaFields.map((f) => {
    if (!f.expression) return { ...f, result: null, error: true }
    try {
      const scope = {}
      measurementFields.forEach((m) => { scope[m.id] = parseFloat(values[m.id]) || 0 })
      const result = evaluate(f.expression, scope)
      return { ...f, result: Number(result).toFixed(2), error: false }
    } catch {
      return { ...f, result: null, error: true }
    }
  })
}

export default function MeasureClient() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const { docs: patterns } = useCollection(user ? `tailors/${user.uid}/patterns` : null)
  const [patternId, setPatternId] = useState('')
  const [pattern, setPattern] = useState(null)
  const [values, setValues] = useState({})
  const [results, setResults] = useState([])
  const [computed, setComputed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!patternId || !user) return
    getDoc(doc(db, 'tailors', user.uid, 'patterns', patternId)).then((snap) => {
      if (snap.exists()) {
        setPattern({ id: snap.id, ...snap.data() })
        setValues({})
        setResults([])
        setComputed(false)
      }
    })
  }, [patternId, user])

  function compute() {
    if (!pattern) return
    const r = computeResults(pattern.formulaFields ?? [], pattern.measurementFields ?? [], values)
    setResults(r)
    setComputed(true)
  }

  async function saveResults() {
    setSaving(true)
    const set = {
      patternId,
      patternName: pattern.name,
      values,
      createdAt: new Date().toISOString(),
    }
    await Promise.race([
      updateDoc(doc(db, 'tailors', user.uid, 'clients', id), {
        measurementSets: arrayUnion(set),
      }),
      new Promise(r => setTimeout(r, 1500)),
    ]).catch(() => {})
    setSaved(true)
    setSaving(false)
    setTimeout(() => navigate(`/clients/${id}`), 500)
  }

  const lang = i18n.language

  return (
    <>
      <div className="page">
        <div className="page-header">
          <button className="btn-ghost" onClick={() => navigate(`/clients/${id}`)}>← Back</button>
          <h1 style={{ fontSize: 18 }}>{t('measure.title')}</h1>
          <div />
        </div>

        {/* Pattern selector */}
        <div className="card" style={{ marginBottom: 16 }}>
          <label className="label">{t('measure.select_pattern')}</label>
          <select
            className="input"
            value={patternId}
            onChange={(e) => setPatternId(e.target.value)}
          >
            <option value="">— Select —</option>
            {patterns.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Measurement inputs */}
        {pattern && (
          <div className="card" style={{ marginBottom: 16 }}>
            <label className="label" style={{ marginBottom: 12 }}>{t('measure.enter_values')}</label>
            {(pattern.measurementFields ?? []).map((f) => (
              <div key={f.id} style={{ marginBottom: 12 }}>
                <label className="label">
                  {lang === 'hi' && f.label_hi ? f.label_hi : f.label_en}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>({f.unit})</span>
                </label>
                <input
                  className="input"
                  type="number"
                  value={values[f.id] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                  placeholder={`e.g. 36`}
                />
              </div>
            ))}
            <button className="btn-primary" style={{ width: '100%' }} onClick={compute}>
              {t('measure.compute')}
            </button>
          </div>
        )}

        {/* Results */}
        {computed && (
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--primary)' }}>
              ✅ {t('measure.results')}
            </div>
            {results.map((r) => (
              <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600 }}>
                    {lang === 'hi' && r.label_hi ? r.label_hi : r.label_en}
                  </span>
                  {r.error
                    ? <span style={{ color: 'var(--error)', fontSize: 13 }}>⚠ Error</span>
                    : <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
                        {r.result} {pattern.measurementFields?.[0]?.unit ?? ''}
                      </span>
                  }
                </div>
                {r.notes && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                    {r.notes}
                  </div>
                )}
              </div>
            ))}

            {!saved ? (
              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 16 }}
                onClick={saveResults}
                disabled={saving}
              >
                {saving ? '...' : t('measure.save_results')}
              </button>
            ) : (
              <p className="success-text" style={{ marginTop: 12, textAlign: 'center', fontSize: 15 }}>
                ✓ {t('measure.saved')}
              </p>
            )}
          </div>
        )}
      </div>
      <NavBar />
    </>
  )
}
