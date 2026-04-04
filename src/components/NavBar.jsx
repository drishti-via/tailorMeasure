import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'

export default function NavBar() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()

  async function toggleLang() {
    const next = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(next)
    if (user) {
      await setDoc(doc(db, 'tailors', user.uid), { language: next }, { merge: true })
    }
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon">🏠</span>
        {t('nav.dashboard')}
      </NavLink>
      <NavLink to="/patterns" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon">📐</span>
        {t('nav.patterns')}
      </NavLink>
      <NavLink to="/clients" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon">👥</span>
        {t('nav.clients')}
      </NavLink>
      <button className="btn-ghost" onClick={toggleLang} style={{ flex: 1, flexDirection: 'column', display: 'flex', alignItems: 'center', padding: '10px 4px 8px', gap: 3, fontSize: 11, color: 'var(--text-muted)', border: 'none', background: 'none' }}>
        <span className="nav-icon">🌐</span>
        {i18n.language === 'en' ? 'हिंदी' : 'English'}
      </button>
      <button className="btn-ghost" onClick={() => signOut(auth)} style={{ flex: 1, flexDirection: 'column', display: 'flex', alignItems: 'center', padding: '10px 4px 8px', gap: 3, fontSize: 11, color: 'var(--text-muted)', border: 'none', background: 'none' }}>
        <span className="nav-icon">🚪</span>
        {t('nav.logout')}
      </button>
    </nav>
  )
}
