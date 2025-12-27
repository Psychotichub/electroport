import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiBaseUrl } from '../services/apiClient'

const featureLinks = [
  { to: '/daily-report', label: 'Daily Report', description: 'Submit site work logs and progress' },
  { to: '/materials', label: 'Materials', description: 'Track materials requested and received' },
  { to: '/received', label: 'Received', description: 'Confirm deliveries and quantities' },
  { to: '/totalprice', label: 'Total Price', description: 'Review site totals and approvals' },
  { to: '/manager', label: 'Manager Dashboard', description: 'Site/company totals, exports' },
  { to: '/settings', label: 'Settings', description: 'Manage profile, company, and site' },
]

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="stack gap-lg">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1 className="title">Hi {user?.username || 'teammate'} 👋</h1>
            <p className="muted">
              You’re signed in as <strong>{user?.role || 'user'}</strong>
              {user?.site ? ` · Site: ${user.site}` : ''}
              {user?.company ? ` · Company: ${user.company}` : ''}
            </p>
          </div>
          <div className="badge">API: {getApiBaseUrl()}</div>
        </div>
        <div className="grid">
          {featureLinks
            .filter((item) => {
              if (['/materials', '/panel'].includes(item.to)) {
                return user?.role === 'admin'
              }
              if (item.to === '/manager') {
                return user?.role === 'manager' || user?.role === 'admin'
              }
              return true
            })
            .map((item) => (
            <Link key={item.to} to={item.to} className="card-link">
              <div className="card">
                <div className="card__title">{item.label}</div>
                <p className="muted">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Device ready</p>
            <h2 className="title-sm">Responsive by default</h2>
          </div>
        </div>
        <p className="muted">
          This React experience is built mobile-first with fluid grids, accessible forms, and a simple navigation that
          collapses on small screens. Add your feature pages under the routes above to match the existing APIs.
        </p>
      </section>
    </div>
  )
}

export default Dashboard

