import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="centered stack gap-md">
      <h1 className="title">Page not found</h1>
      <p className="muted">The page you’re looking for doesn’t exist. Go home to continue.</p>
      <Link className="primary-btn" to="/">
        Back to dashboard
      </Link>
    </div>
  )
}

export default NotFound

