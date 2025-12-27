import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../services/apiClient'

const initialFilters = {
  site: '',
  company: '',
  start: '',
  end: '',
}

const ManagerDashboard = () => {
  const { user, logout } = useAuth()
  const [filters, setFilters] = useState(() => {
    try {
      const site = localStorage.getItem('managerSite') || ''
      const company = localStorage.getItem('managerCompany') || ''
      return { ...initialFilters, site, company }
    } catch (_) {
      return initialFilters
    }
  })
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({ total: 0, materialCost: 0, laborCost: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const hasRange = useMemo(() => Boolean(filters.start && filters.end), [filters.start, filters.end])
  const canFetch = useMemo(() => Boolean(filters.site && filters.company && hasRange), [filters, hasRange])

  const fetchTotals = async () => {
    setLoading(true)
    setError('')
    try {
      // Persist site/company for subsequent calls (mirrors legacy manager behavior)
      localStorage.setItem('managerSite', filters.site)
      localStorage.setItem('managerCompany', filters.company)

      const resp = await apiClient.get('/api/manager/total-prices', {
        params: { start: filters.start, end: filters.end },
        headers: {
          'X-Site': filters.site,
          'X-Company': filters.company,
        },
      })
      const data = Array.isArray(resp.data) ? resp.data : resp.data?.prices || []
      setRows(data)
      const totals = data.reduce(
        (acc, row) => {
          acc.total += Number(row.totalPrice || 0)
          acc.materialCost += Number(row.materialCost || 0)
          acc.laborCost += Number(row.laborCost || 0)
          return acc
        },
        { total: 0, materialCost: 0, laborCost: 0 },
      )
      setStats(totals)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch totals')
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    const headers = ['Material', 'Quantity', 'Material Cost', 'Labor Cost', 'Total Price']
    const lines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.materialName,
          r.quantity,
          Number(r.materialCost || 0).toFixed(2),
          Number(r.laborCost || 0).toFixed(2),
          Number(r.totalPrice || 0).toFixed(2),
        ].join(','),
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'total-prices.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="stack gap-lg">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Manager</p>
            <h1 className="title">Total price management</h1>
            <p className="muted">
              {user?.username} · {user?.role}
            </p>
          </div>
          <button className="ghost-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="form">
          <div className="form-row">
            <label className="form-field">
              <span>Site</span>
              <input name="site" value={filters.site} onChange={handleChange} placeholder="Select site" required />
            </label>
            <label className="form-field">
              <span>Company</span>
              <input name="company" value={filters.company} onChange={handleChange} placeholder="Select company" required />
            </label>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Start date</span>
              <input type="date" name="start" value={filters.start} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>End date</span>
              <input type="date" name="end" value={filters.end} onChange={handleChange} required />
            </label>
          </div>
          {error ? <p className="error">{error}</p> : null}
          <div className="form-row" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
            <button className="primary-btn" type="button" onClick={fetchTotals} disabled={!canFetch || loading}>
              {loading ? 'Fetching…' : 'Calculate Total Prices'}
            </button>
            <button className="ghost-btn" type="button" onClick={exportCsv} disabled={!rows.length}>
              Export CSV
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Summary</p>
            <h2 className="title-sm">Totals over selected range</h2>
          </div>
          <div className="pill">Records: {rows.length}</div>
        </div>
        <div className="grid stats-grid">
          <div className="card">
            <div className="card__title">Material cost</div>
            <div className="title">${stats.materialCost.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="card__title">Labor cost</div>
            <div className="title">${stats.laborCost.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="card__title">Total price</div>
            <div className="title">${stats.total.toFixed(2)}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Results</p>
            <h2 className="title-sm">Calculated totals</h2>
          </div>
        </div>
        <div className="table">
          <div className="table__head">
            <span>Material</span>
            <span>Total Quantity</span>
            <span>Material Cost</span>
            <span>Labor Cost</span>
            <span>Total Price</span>
          </div>
          <div className="table__body">
            {rows.map((row) => (
              <div key={row._id || `${row.materialName}-${row.date}-${row.totalPrice}`} className="table__row">
                <span>{row.materialName}</span>
                <span>
                  {row.quantity} {row.unit}
                </span>
                <span>${Number(row.materialCost || 0).toFixed(2)}</span>
                <span>${Number(row.laborCost || 0).toFixed(2)}</span>
                <span>${Number(row.totalPrice || 0).toFixed(2)}</span>
              </div>
            ))}
            {rows.length === 0 ? <div className="muted">No records yet. Select site, company, and date range.</div> : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ManagerDashboard

