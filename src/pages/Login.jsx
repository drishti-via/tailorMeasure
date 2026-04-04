import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
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
      // Create tailor doc if first login
      const ref = doc(db, 'tailors', uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, { phone: result.user.phoneNumber, language: 'en', name: '', shopName: '' })
      }
      navigate('/dashboard')
    } catch (e) {
      setError(t('common.error'))
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
