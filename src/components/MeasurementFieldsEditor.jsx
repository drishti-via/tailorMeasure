import { useTranslation } from 'react-i18next'

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field'
}

function uniqueId(label, existing) {
  const base = slugify(label)
  let id = base
  let i = 2
  while (existing.includes(id)) {
    id = `${base}_${i++}`
  }
  return id
}

export default function MeasurementFieldsEditor({ fields, onChange }) {
  const { t } = useTranslation()

  function addField() {
    const existingIds = fields.map((f) => f.id)
    const id = uniqueId('field', existingIds)
    onChange([...fields, { id, label_en: '', label_hi: '', unit: 'in' }])
  }

  function updateField(i, key, value) {
    const updated = fields.map((f, idx) => {
      if (idx !== i) return f
      const next = { ...f, [key]: value }
      // Re-derive id when English label changes (only if id was auto-generated)
      if (key === 'label_en') {
        const existingIds = fields.filter((_, j) => j !== i).map((f) => f.id)
        next.id = uniqueId(value, existingIds)
      }
      return next
    })
    onChange(updated)
  }

  function removeField(i) {
    onChange(fields.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>{t('wizard.field_name_en')}</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>{t('wizard.field_name_hi')}</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, width: 70 }}>{t('wizard.unit')}</th>
            <th style={{ width: 36 }}></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '6px 8px' }}>
                <input
                  className="input"
                  value={f.label_en}
                  onChange={(e) => updateField(i, 'label_en', e.target.value)}
                  placeholder="e.g. Chest"
                />
              </td>
              <td style={{ padding: '6px 8px' }}>
                <input
                  className="input"
                  value={f.label_hi}
                  onChange={(e) => updateField(i, 'label_hi', e.target.value)}
                  placeholder="e.g. सीना"
                />
              </td>
              <td style={{ padding: '6px 8px' }}>
                <select
                  className="input"
                  value={f.unit}
                  onChange={(e) => updateField(i, 'unit', e.target.value)}
                >
                  <option value="in">in</option>
                  <option value="cm">cm</option>
                </select>
              </td>
              <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                <button type="button" className="btn-danger" onClick={() => removeField(i)} title="Remove">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="btn-outline"
        onClick={addField}
        style={{ marginTop: 12, width: '100%' }}
      >
        + {t('wizard.add_measurement')}
      </button>
    </div>
  )
}
