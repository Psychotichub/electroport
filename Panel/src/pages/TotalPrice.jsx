import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchDailyReportsByDate, fetchDailyReportsByRange, fetchMaterials } from '../services/userApi'

const TotalPrice = () => {
  const { user } = useAuth()
  const today = new Date().toISOString().slice(0, 10)
  const [records, setRecords] = useState([])
  const [materials, setMaterials] = useState([])
  const [status, setStatus] = useState({ loading: false, error: '' })
  const [rangeFilter, setRangeFilter] = useState({ start: today, end: today })
  const [locationFilter, setLocationFilter] = useState('')
  const [panelFilter, setPanelFilter] = useState('')

  const load = async ({ date, start, end }) => {
    try {
      setStatus((prev) => ({ ...prev, loading: true, error: '' }))
      let list = []
      if (start && end) {
        list = await fetchDailyReportsByRange(start, end)
      } else {
        const targetDate = date || today
        list = await fetchDailyReportsByDate(targetDate)
      }
      setRecords(list)
      setStatus({ loading: false, error: '' })
    } catch (error) {
      setStatus({ loading: false, error: error?.response?.data?.message || 'Failed to load data' })
    }
  }

  useEffect(() => {
    if (rangeFilter.start && rangeFilter.end) {
      void load({ start: rangeFilter.start, end: rangeFilter.end })
    } else {
      void load({ date: today })
    }
  }, [rangeFilter])

  useEffect(() => {
    ;(async () => {
      try {
        const mats = await fetchMaterials()
        setMaterials(mats)
      } catch (_) {
        void 0
      }
    })()
  }, [])

  const filteredRecords = records.filter((r) => {
    const locVal = (r.location || '').trim().toLowerCase()
    const panelVal = (r.panelName || '').trim().toLowerCase()
    const locMatch = locationFilter ? locVal === locationFilter.trim().toLowerCase() : true
    const panelMatch = panelFilter ? panelVal === panelFilter.trim().toLowerCase() : true
    return locMatch && panelMatch
  })

  const locationOptions = Array.from(
    new Set(records.map((r) => (r.location || '').trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))

  const panelOptions = Array.from(
    new Set(records.map((r) => (r.panelName || '').trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))

  const materialPriceMap = materials.reduce((acc, m) => {
    if (m.materialName) {
      acc[m.materialName.toLowerCase()] = {
        materialPrice: Number(m.materialPrice || 0),
        laborPrice: Number(m.laborPrice || 0),
      }
    }
    return acc
  }, {})

  return (
    <div className="stack gap-lg">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Totals</p>
            <h1 className="title">Material & labor totals</h1>
            <p className="muted">
              Signed in as <strong>{user?.username}</strong> · {user?.site} · {user?.company}
            </p>
          </div>
          <div className="form-row" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
            <label className="form-field">
              <span>Start</span>
              <input
                type="date"
                name="start"
                value={rangeFilter.start}
                onChange={(e) => setRangeFilter((prev) => ({ ...prev, start: e.target.value }))}
              />
            </label>
            <label className="form-field">
              <span>End</span>
              <input
                type="date"
                name="end"
                value={rangeFilter.end}
                onChange={(e) => setRangeFilter((prev) => ({ ...prev, end: e.target.value }))}
              />
            </label>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                setRangeFilter({ start: today, end: today })
              }}
            >
              Clear range
            </button>
          </div>
        </div>

        <div className="form-row" style={{ gap: '0.75rem' }}>
          <label className="form-field">
            <span>Filter by location</span>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="">All locations</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Filter by panel</span>
            <select value={panelFilter} onChange={(e) => setPanelFilter(e.target.value)}>
              <option value="">All panels</option>
              {panelOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        {status.error ? <p className="error">{status.error}</p> : null}
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Records</p>
            <h2 className="title-sm">Daily reports</h2>
          </div>
          <div className="badge">{filteredRecords.length} records</div>
        </div>
        <div className="table">
          <div className="table__head">
            <span>Material</span>
            <span>Quantity</span>
            <span>Material Price</span>
            <span>Labor Price</span>
            <span>Total Price</span>
            {locationFilter ? <span>Location</span> : null}
            {panelFilter ? <span>Circuit</span> : null}
          </div>
          <div className="table__body">
            {filteredRecords.map((row) => {
              const pricing = materialPriceMap[(row.materialName || '').toLowerCase()] || {
                materialPrice: null,
                laborPrice: null,
              }
              const materialCost =
                pricing.materialPrice != null ? Number(row.quantity || 0) * pricing.materialPrice : null
              const laborCost = pricing.laborPrice != null ? Number(row.quantity || 0) * pricing.laborPrice : null
              const totalCost = materialCost != null && laborCost != null ? materialCost + laborCost : null
              return (
                <div key={row._id} className="table__row">
                  <span>{row.materialName}</span>
                  <span>
                    {row.quantity} {row.unit}
                  </span>
                  <span>{panelFilter ? '—' : pricing.materialPrice != null ? `$${pricing.materialPrice.toFixed(2)}` : '—'}</span>
                  <span>{panelFilter ? '—' : pricing.laborPrice != null ? `$${pricing.laborPrice.toFixed(2)}` : '—'}</span>
                  <span>
                    {panelFilter ? '—' : totalCost != null ? `$${totalCost.toFixed(2)}` : '—'}
                  </span>
                  {locationFilter ? <span>{row.location || '—'}</span> : null}
                  {panelFilter ? <span>{row.circuit || '—'}</span> : null}
                </div>
              )
            })}
            {records.length === 0 ? <div className="muted">No totals yet.</div> : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export default TotalPrice

