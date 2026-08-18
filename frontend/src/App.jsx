import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteDataProvider } from './context/SiteDataContext'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import DirectoryPage from './pages/DirectoryPage'
import BlogPage from './pages/BlogPage'
import PricingPage from './pages/PricingPage'
import ExtensionsPage from './pages/ExtensionsPage'
import ContactPage from './pages/ContactPage'
import HelpCenterPage from './pages/HelpCenterPage'
import DevelopersPage from './pages/DevelopersPage'
import GetStartedPage from './pages/GetStartedPage'

export default function App() {
  return (
    <BrowserRouter>
      <SiteDataProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="directory" element={<DirectoryPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="extensions" element={<ExtensionsPage />} />
            <Route path="contact-us" element={<ContactPage />} />
            <Route path="help-center" element={<HelpCenterPage />} />
            <Route path="developers" element={<DevelopersPage />} />
            <Route path="get-started" element={<GetStartedPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SiteDataProvider>
    </BrowserRouter>
  )
}
