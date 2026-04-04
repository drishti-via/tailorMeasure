import { useTranslation } from 'react-i18next'
import PillFormulaBuilder, { stepsToExpression } from './PillFormulaBuilder'
import { evalExpression } from './PillFormulaBuilder'

function makeSampleValues(fields) {
  const s = {}
  fields.forEach((f) => { s[f.id] = 36 })
  return s
}

export default function FormulaFieldsEditor({ formulaFields, measurementFields, onChange }) {
  const { t } = useTranslation()
  const sampleValues = makeSampleValues(measurementFields)

  function addField() {
    onChange([...formulaFields, { id: crypto.randomUUID(), label_en: '', label_hi: '', steps: [], expression: '', notes: '' }])
  }

  function updateField(i, key, value) {
    onChange(formulaFields.map((f, idx) => idx === i ? { ...f, [key]: value } : f))
  }

  function updateSteps(i, steps) {
    const expression = stepsToExpression(steps, measurementFields)
    onChange(formulaFields.map((f, idx) => idx === i ? { ...f, steps, expression } : f))
  }

  function removeField(i) {
    onChange(formulaFields.filter((_, idx) => idx !== i))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {formulaFields.map((f, i) => {
        const preview = evalExpression(f.expression, measurementFields, sampleValues)
        return (
          <div key={f.id} className="card" style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-danger"
              onClick={() => removeField(i)}
              style={{ position: 'absolute', top: 10, right: 10 }}
              title="Remove"
            >
              ✕
            </button>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="label">{t('wizard.formula_name_en')}</label>
                <input
                  className="input"
                  value={f.label_en}
                  onChange={(e) => updateField(i, 'label_en', e.target.value)}
                  placeholder="e.g. Front Width"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">{t('wizard.formula_name_hi')}</label>
                <input
                  className="input"
                  value={f.label_hi}
                  onChange={(e) => updateField(i, 'label_hi', e.target.value)}
                  placeholder="e.g. आगे की चौड़ाई"
                />
              </div>
            </div>

            <label className="label">{t('wizard.formula_expression')}</label>
            <PillFormulaBuilder
              steps={f.steps}
              onChange={(steps) => updateSteps(i, steps)}
              measurementFields={measurementFields}
              sampleValues={sampleValues}
            />

            <div style={{ marginTop: 10 }}>
              <label className="label">{t('wizard.notes')}</label>
              <textarea
                className="input"
                value={f.notes}
                onChange={(e) => updateField(i, 'notes', e.target.value)}
                placeholder="e.g. Add 0.5in seam allowance on all sides"
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        )
      })}

      <button type="button" className="btn-outline" onClick={addField} style={{ width: '100%' }}>
        + {t('wizard.add_formula')}
      </button>
    </div>
  )
}
