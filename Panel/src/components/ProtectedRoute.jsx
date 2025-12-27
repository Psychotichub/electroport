import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowRoles }) => {
  const { isAuthenticated, initialized, user } = useAuth()
  const location = useLocation()

  if (!initialized) {
    return (
      <div className="centered">
        <div className="loader" aria-label="Loading session" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowRoles && !allowRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

