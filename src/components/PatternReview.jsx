import { useTranslation } from 'react-i18next'

export default function PatternReview({ name, garmentType, measurementFields, formulaFields }) {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{t('wizard.pattern_name')}</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
        <span className="badge" style={{ marginTop: 6 }}>
          {t(`patterns.garment_type.${garmentType}`)}
        </span>
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 10, color: 'var(--primary)' }}>
          📏 {t('wizard.review_measurements')} ({measurementFields.length})
        </div>
        {measurementFields.length === 0
          ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>None</div>
          : measurementFields.map((f) => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span>{f.label_en} {f.label_hi ? `/ ${f.label_hi}` : ''}</span>
              <span style={{ color: 'var(--text-muted)' }}>{f.unit}</span>
            </div>
          ))
        }
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 10, color: 'var(--primary)' }}>
          🧮 {t('wizard.review_formulas')} ({formulaFields.length})
        </div>
        {formulaFields.length === 0
          ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>None</div>
          : formulaFields.map((f) => (
            <div key={f.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {f.label_en} {f.label_hi ? `/ ${f.label_hi}` : ''}
              </div>
              {f.notes && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{f.notes}</div>}
            </div>
          ))
        }
      </div>
    </div>
  )
}
