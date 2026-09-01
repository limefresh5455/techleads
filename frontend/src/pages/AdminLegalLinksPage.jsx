import { Shield } from 'lucide-react'
export default function AdminLegalLinksPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Shield className="text-brand" />
          Legal Links
        </h1>
      </div>
      {/* Legal links content will go here */}
    </div>
  )
}
