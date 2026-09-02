import { Home } from 'lucide-react'
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Home className="text-brand-dark" />
          Dashboard
        </h1>
      </div>
      {/* Dashboard content will go here */}
    </div>
  )
}
