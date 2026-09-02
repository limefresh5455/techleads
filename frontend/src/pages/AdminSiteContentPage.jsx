import { useState, useEffect } from 'react'
import { Save, Settings, LayoutTemplate, MessageSquare, Globe, Zap, Search, Phone, Calculator, Code } from 'lucide-react'
import { adminSiteContent } from '../adminApi'

const groups = [
  {
    title: 'Brand & Navigation',
    icon: Globe,
    fields: [
      { key: 'brand_name', label: 'Brand Name' },
      { key: 'brand_suffix', label: 'Brand Suffix (e.g. .Ai)' },
      { key: 'logo_text', label: 'Logo Text' },
      { key: 'login_label', label: 'Login Label' },
      { key: 'nav_cta_label', label: 'Navigation CTA Label' },
    ]
  },
  {
    title: 'Hero Section',
    icon: LayoutTemplate,
    fields: [
      { key: 'hero_title', label: 'Hero Title', type: 'textarea' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'hero_search_placeholder', label: 'Search Placeholder' },
      { key: 'hero_search_cta', label: 'Search CTA Button' },
      { key: 'hero_secondary_cta', label: 'Secondary CTA Button' },
    ]
  },
  {
    title: 'Popular Section',
    icon: Zap,
    fields: [
      { key: 'popular_eyebrow', label: 'Eyebrow Text' },
      { key: 'popular_title', label: 'Title' },
    ]
  },
  {
    title: 'Features Section',
    icon: LayoutTemplate,
    fields: [
      { key: 'features_eyebrow', label: 'Eyebrow Text' },
      { key: 'features_title', label: 'Title', type: 'textarea' },
    ]
  },
  {
    title: 'Detect Section',
    icon: Search,
    fields: [
      { key: 'detect_eyebrow', label: 'Eyebrow Text' },
      { key: 'detect_title', label: 'Title', type: 'textarea' },
    ]
  },
  {
    title: 'Enrich Section',
    icon: Zap,
    fields: [
      { key: 'enrich_eyebrow', label: 'Eyebrow Text' },
      { key: 'enrich_title', label: 'Title', type: 'textarea' },
      { key: 'enrich_subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'enrich_cta', label: 'CTA Button' },
    ]
  },

  {
    title: 'Pricing & Calculator',
    icon: Calculator,
    fields: [
      { key: 'pricing_title', label: 'Pricing Title' },
      { key: 'pricing_subtitle', label: 'Pricing Subtitle' },
      { key: 'pricing_yearly_badge', label: 'Yearly Badge' },
      { key: 'calculator_title', label: 'Calculator Title' },
      { key: 'calculator_subtitle', label: 'Calculator Subtitle' },
      { key: 'calculator_default_leads', label: 'Default Leads', type: 'number' },
    ]
  },
  {
    title: 'Final CTA',
    icon: Zap,
    fields: [
      { key: 'final_cta_title', label: 'Title', type: 'textarea' },
      { key: 'final_cta_primary', label: 'Primary Button' },
      { key: 'final_cta_secondary', label: 'Secondary Button' },
    ]
  },
  {
    title: 'Contact & Chat',
    icon: Phone,
    fields: [
      { key: 'contact_title', label: 'Contact Title' },
      { key: 'contact_subtitle', label: 'Contact Subtitle' },
      { key: 'contact_button_label', label: 'Contact Submit Button' },
      { key: 'chat_label', label: 'Floating Chat Label' },
    ]
  },
  {
    title: 'Footer',
    icon: LayoutTemplate,
    fields: [
      { key: 'footer_about', label: 'About Text', type: 'textarea' },
      { key: 'footer_copyright', label: 'Copyright Text' },
    ]
  }
]

export default function AdminSiteContentPage() {
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const data = await adminSiteContent.get()
      setFormData(data || {})
    } catch (err) {
      console.error('Failed to load site content', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...formData }
      if (payload.calculator_default_leads) {
        payload.calculator_default_leads = parseInt(payload.calculator_default_leads, 10)
      }
      await adminSiteContent.update(payload)
      alert('Site content saved successfully!')
    } catch (err) {
      console.error('Failed to save content', err)
      alert('Error saving content.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div className="p-8 text-ink">Loading...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Globe className="text-brand-dark shrink-0" />
          <span className="whitespace-nowrap">Site Content</span>
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-fit bg-brand text-on-brand px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {groups.map((g, idx) => {
            const Icon = g.icon
            const isActive = activeTab === idx
            return (
              <button
                key={g.title}
                onClick={() => setActiveTab(idx)}
                className={`flex shrink-0 whitespace-nowrap items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand' : 'text-ink/70 hover:bg-surface hover:text-ink'}`}
              >
                <Icon size={18} className={isActive ? 'text-brand' : 'text-muted'} />
                {g.title}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
            {groups[activeTab].title}
          </h2>
          
          <form className="space-y-6">
            {groups[activeTab].fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={field.rows || 3}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-brand font-mono text-sm"
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-brand"
                  />
                )}
              </div>
            ))}
          </form>
        </div>
      </div>
    </div>
  )
}
