import { Navigate, useLocation } from 'react-router-dom'
import { useSiteData } from '../context/SiteDataContext'

export default function ProtectedRoute({ children }) {
  const { user } = useSiteData()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
