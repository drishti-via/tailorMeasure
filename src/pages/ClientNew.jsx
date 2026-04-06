import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import NavBar from '../components/NavBar'

export default function ClientNew() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim() || !phone.trim()) return
    setSaving(true)
    await Promise.race([
      addDoc(collection(db, 'tailors', user.uid, 'clients'), {
        name: name.trim(),
        phone: phone.trim(),
        measurementSets: [],
      }),
      new Promise(r => setTimeout(r, 1500)),
    ]).catch(() => {})
    navigate('/clients')
  }

  return (
    <>
      <div className="page">
        <div className="page-header">
          <button className="btn-ghost" onClick={() => navigate('/clients')}>← Back</button>
          <h1 style={{ fontSize: 18 }}>{t('clients.new')}</h1>
          <div />
        </div>

        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <label className="label">{t('clients.name')}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">{t('clients.phone')}</label>
            <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" />
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={save}
            disabled={saving || !name.trim() || !phone.trim()}
          >
            {saving ? '...' : t('clients.save')}
          </button>
        </div>
      </div>
      <NavBar />
    </>
  )
}
