import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TopNav = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="top-nav">
      <div className="top-nav__brand">
        <Link to="/" className="brand-mark">
          <span className="brand-dot" />
          Panel App
        </Link>
        <button
          type="button"
          className="top-nav__toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </div>
      <nav className={`top-nav__links ${open ? 'is-open' : ''}`}>
        {isAuthenticated ? (
          <>
            <NavLink to="/" onClick={() => setOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink to="/daily-report" onClick={() => setOpen(false)}>
              Daily Report
            </NavLink>
            <NavLink to="/received" onClick={() => setOpen(false)}>
              Received
            </NavLink>
            {user?.role === 'admin' ? (
              <>
                <NavLink to="/totalprice" onClick={() => setOpen(false)}>
                  Total Price
                </NavLink>
                <NavLink to="/materials" onClick={() => setOpen(false)}>
                  Materials
                </NavLink>
                <NavLink to="/panel" onClick={() => setOpen(false)}>
                  Panel
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/totalprice" onClick={() => setOpen(false)}>
                  Total Price
                </NavLink>
                {user?.role === 'manager' ? (
                  <NavLink to="/manager" onClick={() => setOpen(false)}>
                    Manager
                  </NavLink>
                ) : null}
              </>
            )}
            <NavLink to="/settings" onClick={() => setOpen(false)}>
              Settings
            </NavLink>
            <button type="button" className="ghost-btn" onClick={handleLogout}>
              Logout {user?.username ? `(${user.username})` : ''}
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" onClick={() => setOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/register" onClick={() => setOpen(false)}>
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  )
}

export default TopNav

