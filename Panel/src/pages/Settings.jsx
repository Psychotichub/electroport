import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchUserSiteDetails } from '../services/userApi'

const Settings = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [status, setStatus] = useState({ loading: true, error: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchUserSiteDetails()
        setData(res)
        setStatus({ loading: false, error: '' })
      } catch (error) {
        setStatus({ loading: false, error: error?.response?.data?.message || 'Failed to load settings' })
      }
    }
    void load()
  }, [])

  if (status.loading) {
    return (
      <div className="centered">
        <div className="loader" />
      </div>
    )
  }

  if (status.error) {
    return (
      <div className="centered stack gap-md">
        <p className="error">{status.error}</p>
      </div>
    )
  }

  const { userDetails, siteStatistics } = data || {}

  return (
    <div className="stack gap-lg">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Account</p>
            <h1 className="title">Profile & site</h1>
            <p className="muted">
              {userDetails?.username} · {userDetails?.role} · {userDetails?.site} · {userDetails?.company}
            </p>
          </div>
        </div>
        <div className="stack gap-md">
          <div className="pill">Joined: {userDetails?.createdAt ? new Date(userDetails.createdAt).toDateString() : '—'}</div>
          <div className="pill">Site: {userDetails?.site || '—'}</div>
          <div className="pill">Company: {userDetails?.company || '—'}</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Usage</p>
            <h2 className="title-sm">Site statistics</h2>
          </div>
        </div>
        <div className="grid stats-grid">
          {[
            { label: 'Daily reports', value: siteStatistics?.dailyReports },
            { label: 'Materials', value: siteStatistics?.materials },
            { label: 'Received', value: siteStatistics?.receivedItems },
            { label: 'Total prices', value: siteStatistics?.totalPrices },
            { label: 'Monthly reports', value: siteStatistics?.monthlyReports },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <div className="card__title">{stat.label}</div>
              <div className="title">{stat.value ?? 0}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Settings

