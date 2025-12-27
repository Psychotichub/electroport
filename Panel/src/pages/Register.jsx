import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    password: '',
    site: '',
    company: '',
    role: 'user',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const result = await register(form)
    if (!result.success) {
      setError(result.message)
      return
    }
    setSuccess('Account created. You can sign in now.')
    setTimeout(() => navigate('/login'), 800)
  }

  return (
    <div className="auth-grid">
      <section className="panel">
        <p className="eyebrow">Create account</p>
        <h1 className="title">Register</h1>
        <p className="muted">Link users to their site/company for proper access control.</p>
      </section>
      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Username</span>
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>Site</span>
              <input name="site" value={form.site} onChange={handleChange} placeholder="e.g. Site A" />
            </label>
            <label className="form-field">
              <span>Company</span>
              <input name="company" value={form.company} onChange={handleChange} placeholder="e.g. Acme" />
            </label>
          </div>

          <label className="form-field">
            <span>Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </label>

          {error ? <p className="error">{error}</p> : null}
          {success ? <p className="success">{success}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <p className="muted">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  )
}

export default Register

