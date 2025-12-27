import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login, loading } = useAuth()
  const [accountType, setAccountType] = useState('user') // user/admin vs manager
  const [form, setForm] = useState({ username: '', password: '', site: '', company: '' })
  const [error, setError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (accountType !== 'manager') {
      if (!form.site || !form.company) {
        setError('Site and company are required for user/admin login.')
        return
      }
    }
    const payload = {
      ...form,
      site: accountType === 'manager' ? '' : form.site,
      company: accountType === 'manager' ? '' : form.company,
    }
    const result = await login(payload)
    if (!result.success) {
      setError(result.message)
      return
    }
    const redirectTo = location.state?.from?.pathname || '/'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="auth-grid">
      <section className="panel">
        <p className="eyebrow">Welcome to Panel</p>
        <h1 className="title">Sign in</h1>
        <p className="muted">Optimized for mobile, tablet, and desktop.</p>
        <div className="pill" style={{ marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="radio"
              name="acct"
              value="user"
              checked={accountType === 'user'}
              onChange={() => setAccountType('user')}
            />
            User / Admin
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="radio"
              name="acct"
              value="manager"
              checked={accountType === 'manager'}
              onChange={() => setAccountType('manager')}
            />
            Manager
          </label>
        </div>
      </section>
      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Username</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>Site</span>
              <input
                name="site"
                value={form.site}
                onChange={handleChange}
                placeholder={accountType === 'manager' ? 'Not required for managers' : 'Required for users/admins'}
                disabled={accountType === 'manager'}
                required={accountType !== 'manager'}
              />
            </label>
            <label className="form-field">
              <span>Company</span>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder={accountType === 'manager' ? 'Not required for managers' : 'Required for users/admins'}
                disabled={accountType === 'manager'}
                required={accountType !== 'manager'}
              />
            </label>
          </div>

          {error ? <p className="error">{error}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="muted">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  )
}

export default Login

