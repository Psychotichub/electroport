import apiClient from './apiClient'

export const fetchMaterials = async () => {
  const { data } = await apiClient.get('/api/user/materials')
  return data
}

export const createMaterial = async (payload) => {
  const { data } = await apiClient.post('/api/user/materials', payload)
  return data
}

export const updateMaterial = async (payload) => {
  const { data } = await apiClient.put('/api/user/materials', payload)
  return data
}

export const deleteMaterial = async (materialName) => {
  await apiClient.delete(`/api/user/materials/${encodeURIComponent(materialName)}`)
}

export const fetchPanels = async () => {
  const { data } = await apiClient.get('/api/user/panels')
  return data
}

export const createPanel = async (payload) => {
  const { data } = await apiClient.post('/api/user/panels', payload)
  return data
}

export const updatePanel = async (payload) => {
  const { data } = await apiClient.put('/api/user/panels', payload)
  return data
}

export const deletePanel = async (panelName) => {
  await apiClient.delete(`/api/user/panels/${encodeURIComponent(panelName)}`)
}

export const fetchDailyReports = async () => {
  const { data } = await apiClient.get('/api/user/daily-reports')
  return data
}

export const fetchDailyReportsByDate = async (date) => {
  const { data } = await apiClient.get(`/api/user/daily-reports/date/${encodeURIComponent(date)}`)
  return data
}

export const fetchDailyReportsByRange = async (start, end) => {
  const params = new URLSearchParams({ start, end })
  const { data } = await apiClient.get(`/api/user/daily-reports/range?${params.toString()}`)
  return data
}

export const createDailyReport = async (report) => {
  const { data } = await apiClient.post('/api/user/daily-reports', { materials: [report] })
  return data
}

export const updateDailyReport = async (id, payload) => {
  const { data } = await apiClient.put(`/api/user/daily-reports/${id}`, payload)
  return data
}

export const deleteDailyReport = async (id) => {
  await apiClient.delete(`/api/user/daily-reports/${id}`)
}

export const fetchReceived = async () => {
  const { data } = await apiClient.get('/api/user/received')
  return data
}

export const fetchReceivedByDate = async (date) => {
  const { data } = await apiClient.get(`/api/user/received/date/${encodeURIComponent(date)}`)
  return data
}

export const createReceived = async (item) => {
  const { data } = await apiClient.post('/api/user/received', { materials: [item] })
  return data
}

export const updateReceived = async (id, payload) => {
  const { data } = await apiClient.put(`/api/user/received/${id}`, payload)
  return data
}

export const deleteReceived = async (id) => {
  await apiClient.delete(`/api/user/received/${id}`)
}

export const fetchTotalPrices = async () => {
  const { data } = await apiClient.get('/api/user/total-prices')
  return data
}

export const fetchTotalPricesByDate = async (date) => {
  const { data } = await apiClient.get(`/api/user/total-prices/date/${encodeURIComponent(date)}`)
  return data
}

export const fetchTotalPricesByRange = async (start, end) => {
  const params = new URLSearchParams({ start, end })
  const { data } = await apiClient.get(`/api/user/total-prices/range?${params.toString()}`)
  return data
}

export const createTotalPrice = async (material) => {
  const { data } = await apiClient.post('/api/user/total-prices', { materials: [material] })
  return data
}

export const updateTotalPrice = async (id, payload) => {
  const { data } = await apiClient.put(`/api/user/total-prices/${id}`, payload)
  return data
}

export const deleteTotalPrice = async (id) => {
  await apiClient.delete(`/api/user/total-prices/${id}`)
}

export const fetchUserSiteDetails = async () => {
  const { data } = await apiClient.get('/api/settings/user-site-details')
  return data
}

