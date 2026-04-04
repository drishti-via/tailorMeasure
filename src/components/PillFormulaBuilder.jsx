import { useState } from 'react'
import { evaluate } from 'mathjs'
import { useTranslation } from 'react-i18next'

const OPERATORS = ['+', '−', '×', '÷']
const OP_MAP = { '+': '+', '−': '-', '×': '*', '÷': '/' }

function stepsToExpression(steps, fields) {
  return steps.map((s) => {
    if (s.type === 'measurement') {
      const f = fields.find((f) => f.id === s.fieldId)
      return f ? f.id : '0'
    }
    if (s.type === 'operator') return OP_MAP[s.value] ?? s.value
    if (s.type === 'number') return String(s.value)
    return ''
  }).join(' ')
}

export function evalExpression(expression, fields, values) {
  if (!expression.trim()) return null
  try {
    const scope = {}
    fields.forEach((f) => { scope[f.id] = values[f.id] ?? 0 })
    return evaluate(expression, scope)
  } catch {
    return null
  }
}

export default function PillFormulaBuilder({ steps = [], onChange, measurementFields = [], sampleValues = {} }) {
  const { t } = useTranslation()
  const [numInput, setNumInput] = useState('')

  const expression = stepsToExpression(steps, measurementFields)
  const preview = evalExpression(expression, measurementFields, sampleValues)

  function addStep(step) {
    onChange([...steps, step])
  }

  function removeStep(i) {
    onChange(steps.filter((_, idx) => idx !== i))
  }

  function addNumber() {
    const n = parseFloat(numInput)
    if (isNaN(n)) return
    addStep({ type: 'number', value: n })
    setNumInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Pill row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 38, alignItems: 'center', background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 10px' }}>
        {steps.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
        {steps.map((s, i) => (
          <span
            key={i}
            onClick={() => removeStep(i)}
            title="Click to remove"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: s.type === 'measurement' ? 'var(--primary)' : s.type === 'operator' ? '#f5f5f5' : '#fff3e0',
              color: s.type === 'measurement' ? 'white' : 'var(--text)',
              border: s.type === 'operator' ? '1px solid var(--border)' : 'none',
              borderRadius: 16,
              padding: '3px 10px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s.type === 'measurement'
              ? measurementFields.find((f) => f.id === s.fieldId)?.label_en ?? s.fieldId
              : s.type === 'operator' ? s.value
              : s.value}
            <span style={{ opacity: 0.6, fontSize: 11 }}>×</span>
          </span>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {/* Measurement chips */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{t('wizard.pill_add_measurement')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {measurementFields.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => addStep({ type: 'measurement', fieldId: f.id })}
                style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                {f.label_en}
              </button>
            ))}
          </div>
        </div>

        {/* Operators */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{t('wizard.pill_operators')}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {OPERATORS.map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => addStep({ type: 'operator', value: op })}
                style={{ background: '#f5f5f5', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: 15, fontWeight: 700, cursor: 'pointer', minWidth: 36 }}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Number */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{t('wizard.pill_number')}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              value={numInput}
              onChange={(e) => setNumInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNumber()}
              placeholder="0"
              style={{ width: 70, border: '1.5px solid var(--border)', borderRadius: 8, padding: '4px 8px', fontSize: 13 }}
            />
            <button
              type="button"
              onClick={addNumber}
              style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div style={{
        fontSize: 13,
        padding: '6px 10px',
        borderRadius: 'var(--radius)',
        background: preview !== null ? 'var(--success-light)' : steps.length === 0 ? 'var(--bg)' : 'var(--error-light)',
        color: preview !== null ? 'var(--success)' : 'var(--error)',
        fontWeight: 600,
      }}>
        {steps.length === 0
          ? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{t('wizard.live_preview')}: —</span>
          : preview !== null
          ? `${t('wizard.live_preview')}: ${Number(preview).toFixed(2)}`
          : `⚠ ${t('wizard.expression_error')}`}
      </div>
    </div>
  )
}

export { stepsToExpression }
