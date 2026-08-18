import { Navigate } from 'react-router-dom'
import { useSiteData } from '../context/SiteDataContext'

export default function GuestRoute({ children }) {
  const { user } = useSiteData()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
