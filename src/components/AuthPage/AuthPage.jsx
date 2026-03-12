import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        setSuccessMsg('Check your email for a confirmation link!')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(newMode) {
    setMode(newMode)
    setError(null)
    setSuccessMsg(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🌸</div>
          <div className={styles.logoText}>
            <h1>Petal</h1>
            <p>Your cute spending buddy</p>
          </div>
        </div>

        <div className={styles.tabRow} role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchMode('login')}
          >
            Log In
          </button>
          <button
            role="tab"
            aria-selected={mode === 'signup'}
            className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              className={styles.input}
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}
          {successMsg && <p className={styles.error} role="status" style={{ color: 'oklch(55% 0.12 145)', background: 'color-mix(in oklch, oklch(55% 0.12 145) 10%, transparent)' }}>{successMsg}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
