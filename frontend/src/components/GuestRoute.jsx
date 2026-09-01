import { Navigate } from 'react-router-dom'
import { useSiteData } from '../context/SiteDataContext'

export default function GuestRoute({ children }) {
  const { user } = useSiteData()

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}
