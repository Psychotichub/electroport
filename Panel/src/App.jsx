import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Panels from './pages/Panels'
import DailyReport from './pages/DailyReport'
import Materials from './pages/Materials'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import Received from './pages/Received'
import ManagerDashboard from './pages/ManagerDashboard'
import Settings from './pages/Settings'
import TotalPrice from './pages/TotalPrice'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-report"
            element={
              <ProtectedRoute>
                <DailyReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials"
            element={
              <ProtectedRoute allowRoles={['admin']}>
                <Materials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel"
            element={
              <ProtectedRoute allowRoles={['admin']}>
                <Panels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/received"
            element={
              <ProtectedRoute>
                <Received />
              </ProtectedRoute>
            }
          />
          <Route
            path="/totalprice"
            element={
              <ProtectedRoute>
                <TotalPrice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowRoles={['manager', 'admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
