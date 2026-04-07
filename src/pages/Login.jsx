import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signInWithGoogle() {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const uid = result.user.uid
      const ref = doc(db, 'tailors', uid)
      getDoc(ref).then(snap => {
        if (!snap.exists()) {
          setDoc(ref, { name: result.user.displayName ?? '', phone: '', language: 'en', shopName: '' }).catch(() => {})
        }
      }).catch(() => {})
      navigate('/dashboard')
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(t('common.error'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>✂️</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{t('app_name')}</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{t('tagline')}</p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 20, fontSize: 18 }}>{t('login.title')}</h2>

        {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}

        <button
          className="btn-outline"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? t('common.loading') : t('login.google')}
        </button>
      </div>
    </div>
  )
}
