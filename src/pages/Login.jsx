import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const confirmRef = useRef(null)
  const inputRefs = useRef([])

  async function sendOtp() {
    setError('')
    setLoading(true)
    try {
      if (window.__e2e__) {
        auth.settings.appVerificationDisabledForTesting = true
      }
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        })
      }
      const fullPhone = `+91${phone.replace(/\s/g, '')}`
      const result = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier)
      confirmRef.current = result
      setStep('otp')
    } catch (e) {
      setError(e.message)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    const code = otp.join('')
    if (code.length < 6) return
    setError('')
    setLoading(true)
    try {
      const result = await confirmRef.current.confirm(code)
      const uid = result.user.uid
      // Create tailor doc in background — don't block navigation
      const ref = doc(db, 'tailors', uid)
      getDoc(ref).then(snap => {
        if (!snap.exists()) {
          setDoc(ref, { phone: result.user.phoneNumber, language: 'en', name: '', shopName: '' }).catch(() => {})
        }
      }).catch(() => {})
      navigate('/dashboard')
    } catch (e) {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const uid = result.user.uid
      // Create tailor doc in background — don't block navigation
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

  function handleOtpChange(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
    if (e.key === 'Enter' && otp.join('').length === 6) verifyOtp()
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

        <button
          className="btn-outline"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {t('login.google')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--text-muted)', fontSize: 13 }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
          or
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
        </div>

        {step === 'phone' ? (
          <>
            <label className="label">{t('login.phone_label')}</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 14 }}>
                🇮🇳 +91
              </div>
              <input
                className="input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('login.phone_placeholder')}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                maxLength={10}
              />
            </div>
            {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={sendOtp}
              disabled={loading || phone.length < 10}
            >
              {loading ? t('login.sending') : t('login.send_otp')}
            </button>
          </>
        ) : (
          <>
            <label className="label">{t('login.otp_label')}</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  style={{
                    width: 44,
                    height: 52,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    outline: 'none',
                  }}
                />
              ))}
            </div>
            {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
            <button
              className="btn-primary"
              style={{ width: '100%', marginBottom: 10 }}
              onClick={verifyOtp}
              disabled={loading || otp.join('').length < 6}
            >
              {loading ? t('login.verifying') : t('login.verify')}
            </button>
            <button className="btn-ghost" style={{ width: '100%' }} onClick={() => setStep('phone')}>
              ← {t('login.resend')}
            </button>
          </>
        )}
      </div>

      <div id="recaptcha-container" />
    </div>
  )
}
