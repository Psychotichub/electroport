import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createMaterial, deleteMaterial, fetchMaterials, updateMaterial } from '../services/userApi'

const emptyForm = {
  materialName: '',
  unit: 'm',
  materialPrice: '',
  laborPrice: '',
}

const Materials = () => {
  const { user } = useAuth()
  const [materials, setMaterials] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })
  const [editingName, setEditingName] = useState(null)

  const load = async () => {
    try {
      const data = await fetchMaterials()
      setMaterials(data)
    } catch (error) {
      setStatus({ loading: false, error: error?.response?.data?.message || 'Failed to load materials', success: '' })
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: '', success: '' })
    try {
      if (editingName) {
        await updateMaterial({
          originalMaterialName: editingName,
          materialName: form.materialName,
          unit: form.unit,
          materialPrice: Number(form.materialPrice),
          laborPrice: Number(form.laborPrice),
        })
        setStatus({ loading: false, error: '', success: 'Material updated' })
      } else {
        await createMaterial({
          ...form,
          materialPrice: Number(form.materialPrice),
          laborPrice: Number(form.laborPrice),
        })
        setStatus({ loading: false, error: '', success: 'Material added' })
      }
      setEditingName(null)
      setForm(emptyForm)
      await load()
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.response?.data?.message || 'Failed to add material (admin only)',
        success: '',
      })
    }
  }

  const handleDelete = async (name) => {
    await deleteMaterial(name)
    await load()
  }

  const handleEdit = (m) => {
    setEditingName(m.materialName)
    setForm({
      materialName: m.materialName || '',
      unit: m.unit || 'm',
      materialPrice: m.materialPrice || '',
      laborPrice: m.laborPrice || '',
    })
  }

  return (
    <div className="stack gap-lg">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Materials</p>
            <h1 className="title">Manage pricing</h1>
            <p className="muted">
              Admin only. Signed in as <strong>{user?.username}</strong> ({user?.role})
            </p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-field">
              <span>Name</span>
              <input name="materialName" value={form.materialName} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Unit</span>
              <select name="unit" value={form.unit} onChange={handleChange} required>
                <option value="m">Meter</option>
                <option value="pcs">Pcs</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Material price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                name="materialPrice"
                value={form.materialPrice}
                onChange={handleChange}
                required
              />
            </label>
            <label className="form-field">
              <span>Labor price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                name="laborPrice"
                value={form.laborPrice}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {status.error ? <p className="error">{status.error}</p> : null}
          {status.success ? <p className="success">{status.success}</p> : null}

          <div className="form-row" style={{ gap: '0.75rem' }}>
            <button className="primary-btn" type="submit" disabled={status.loading || user?.role !== 'admin'}>
              {status.loading ? 'Saving…' : editingName ? 'Update material' : 'Add material'}
            </button>
            {editingName ? (
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  setEditingName(null)
                  setForm(emptyForm)
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2 className="title-sm">Materials</h2>
          </div>
          <div className="badge">{materials.length} items</div>
        </div>
        <div className="table">
          <div className="table__head">
            <span>Name</span>
            <span>Unit</span>
            <span>Material</span>
            <span>Labor</span>
            <span />
          </div>
          <div className="table__body">
            {materials.map((m) => (
              <div key={m._id || m.materialName} className="table__row">
                <span>{m.materialName}</span>
                <span>{m.unit}</span>
                <span>${m.materialPrice}</span>
                <span>${m.laborPrice}</span>
                <span className="table__actions">
                  {user?.role === 'admin' ? (
                    <>
                      <button className="ghost-btn" type="button" onClick={() => handleEdit(m)}>
                        Edit
                      </button>
                      <button className="ghost-btn" type="button" onClick={() => handleDelete(m.materialName)}>
                        Delete
                      </button>
                    </>
                  ) : null}
                </span>
              </div>
            ))}
            {materials.length === 0 ? <div className="muted">No materials yet.</div> : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Materials

