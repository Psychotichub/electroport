import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import apiClient, { setAuthToken } from '../services/apiClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'))
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      fetchCurrentUser()
    } else {
      setInitialized(true)
    }
  }, [token])

  const fetchCurrentUser = async () => {
    try {
      const { data } = await apiClient.get('/api/auth/me')
      setUser(data.user)
    } catch (error) {
      setUser(null)
      setToken(null)
      setAuthToken(null)
      localStorage.removeItem('auth_token')
      console.error('Failed to hydrate session', error?.response?.data || error.message)
    } finally {
      setInitialized(true)
    }
  }

  const login = async (payload) => {
    setLoading(true)
    try {
      const { data } = await apiClient.post('/api/auth/login', payload)
      const newToken = data?.token
      if (newToken) {
        setToken(newToken)
        setAuthToken(newToken)
        localStorage.setItem('auth_token', newToken)
      }
      setUser(data.user || null)
      return { success: true }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to log in'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const { data } = await apiClient.post('/api/auth/register', payload)
      return { success: true, user: data?.user }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to register'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('auth_token')
    try {
      await apiClient.post('/api/auth/logout')
    } catch (_) {
      void 0
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      initialized,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, loading, initialized],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

