import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteDataProvider } from './context/SiteDataContext'
import { AdminRoutes, AppRoutes } from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <SiteDataProvider>
        <Routes>
          <Route path="admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </SiteDataProvider>
    </BrowserRouter>
  )
}
