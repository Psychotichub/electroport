import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

// Attach X-Site/X-Company headers for manager/admin context if set (skip auth endpoints)
apiClient.interceptors.request.use((config) => {
  try {
    const url = config.url || ''
    const isAuthCall = url.includes('/api/auth/')
    if (!isAuthCall) {
      const site = localStorage.getItem('managerSite')
      const company = localStorage.getItem('managerCompany')
      if (site && company) {
        config.headers['X-Site'] = site
        config.headers['X-Company'] = company
      }
    }
  } catch (_) {
    void 0
  }
  return config
})

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

export const getApiBaseUrl = () => apiBaseUrl

export default apiClient

