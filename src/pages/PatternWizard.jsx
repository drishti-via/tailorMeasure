import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { doc, setDoc, addDoc, collection, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import MeasurementFieldsEditor from '../components/MeasurementFieldsEditor'
import FormulaFieldsEditor from '../components/FormulaFieldsEditor'
import PatternReview from '../components/PatternReview'
import NavBar from '../components/NavBar'
import { useEffect } from 'react'

const STEPS = ['step1', 'step2', 'step3']

export default function PatternWizard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [garmentType, setGarmentType] = useState('both')
  const [measurementFields, setMeasurementFields] = useState([])
  const [formulaFields, setFormulaFields] = useState([])

  useEffect(() => {
    if (!isEdit || !user) return
    getDoc(doc(db, 'tailors', user.uid, 'patterns', id)).then((snap) => {
      if (!snap.exists()) return
      const d = snap.data()
      setName(d.name ?? '')
      setGarmentType(d.garmentType ?? 'both')
      setMeasurementFields(d.measurementFields ?? [])
      setFormulaFields(d.formulaFields ?? [])
    })
  }, [id, isEdit, user])

  async function save() {
    setSaving(true)
    const data = { name, garmentType, measurementFields, formulaFields }
    const writeOp = isEdit
      ? setDoc(doc(db, 'tailors', user.uid, 'patterns', id), data, { merge: true })
      : addDoc(collection(db, 'tailors', user.uid, 'patterns'), data)
    await Promise.race([writeOp, new Promise(r => setTimeout(r, 1500))]).catch(() => {})
    navigate('/patterns')
  }

  return (
    <>
      <div className="page-wide" style={{ paddingBottom: 100 }}>
        {/* Header */}
        <div className="page-header">
          <button className="btn-ghost" onClick={() => navigate('/patterns')}>← Back</button>
          <h1 style={{ fontSize: 18 }}>{isEdit ? t('patterns.edit') : t('patterns.new')}</h1>
          <div />
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= step ? 'var(--primary)' : 'var(--border)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: i === step ? 700 : 400, color: i === step ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              {t(`wizard.${s}`)}
            </div>
          ))}
        </div>

        {/* Step 0: Measurements */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">{t('wizard.pattern_name')}</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ladies Salwar Kameez"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">{t('wizard.garment_type')}</label>
              <select className="input" value={garmentType} onChange={(e) => setGarmentType(e.target.value)}>
                <option value="indian">{t('patterns.garment_type.indian')}</option>
                <option value="western">{t('patterns.garment_type.western')}</option>
                <option value="both">{t('patterns.garment_type.both')}</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">{t('wizard.measurement_fields')}</label>
              <MeasurementFieldsEditor fields={measurementFields} onChange={setMeasurementFields} />
            </div>
          </div>
        )}

        {/* Step 1: Formulas */}
        {step === 1 && (
          <div>
            <label className="label" style={{ marginBottom: 12 }}>{t('wizard.formula_fields')}</label>
            <FormulaFieldsEditor
              formulaFields={formulaFields}
              measurementFields={measurementFields}
              onChange={setFormulaFields}
            />
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <PatternReview
            name={name}
            garmentType={garmentType}
            measurementFields={measurementFields}
            formulaFields={formulaFields}
          />
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
          <button
            className="btn-outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            style={{ flex: 1 }}
          >
            {t('wizard.back')}
          </button>
          {step < 2 ? (
            <button
              className="btn-primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !name.trim()}
              style={{ flex: 1 }}
            >
              {t('wizard.next')}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={save}
              disabled={saving}
              style={{ flex: 1 }}
            >
              {saving ? '...' : t('wizard.save')}
            </button>
          )}
        </div>
      </div>
      <NavBar />
    </>
  )
}
