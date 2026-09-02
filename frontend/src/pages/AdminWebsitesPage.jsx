import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Loader2, Link as LinkIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminWebsites, adminTechnologies } from '../adminApi'
import SearchableDropdown from '../components/SearchableDropdown'

export default function AdminWebsitesPage() {
  const [items, setItems] = useState([])
  const [technologies, setTechnologies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const defaultForm = { 
    domain: '', title: '', description: '', company_name: '', emails: '',
    country: '', category_label: 'Uncategorized', contact_info: 'No contact information available',
    facebook_url: '', twitter_url: '', linkedin_url: '', instagram_url: '',
    youtube_url: '', github_url: '', tiktok_url: '', source_url: '', rank: 0, sort_order: 0,
    technology_ids: []
  }
  
  const [formData, setFormData] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [page, search])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Pass pagination limit as 1000 for technologies dropdown
      const [webData, techData] = await Promise.all([
        adminWebsites.getAll({ page, limit, search }),
        adminTechnologies.getAll({ page: 1, limit: 1000 })
      ])
      setItems(webData.items || [])
      setTotal(webData.total || 0)
      setTotalPages(webData.total_pages || 1)
      setTechnologies(techData.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleOpenNew = () => {
    setFormData({ ...defaultForm })
    setEditingId('new')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setFormData({
      domain: item.domain || '',
      title: item.title || '',
      description: item.description || '',
      company_name: item.company_name || '',
      emails: item.emails || '',
      country: item.country || '',
      category_label: item.category_label || 'Uncategorized',
      contact_info: item.contact_info || 'No contact information available',
      facebook_url: item.facebook_url || '',
      twitter_url: item.twitter_url || '',
      linkedin_url: item.linkedin_url || '',
      instagram_url: item.instagram_url || '',
      youtube_url: item.youtube_url || '',
      github_url: item.github_url || '',
      tiktok_url: item.tiktok_url || '',
      source_url: item.source_url || '',
      rank: item.rank || 0,
      sort_order: item.sort_order || 0,
      technology_ids: item.technology_ids || []
    })
    setEditingId(item.id)
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId === 'new') {
        await adminWebsites.create(formData)
      } else {
        await adminWebsites.update(editingId, formData)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this website?')) return
    try {
      await adminWebsites.delete(id)
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }
  
  const handleTechToggle = (techId) => {
    setFormData(prev => {
      const current = prev.technology_ids
      if (current.includes(techId)) {
        return { ...prev, technology_ids: current.filter(id => id !== techId) }
      } else {
        return { ...prev, technology_ids: [...current, techId] }
      }
    })
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <LinkIcon className="text-brand-dark shrink-0" />
          <span className="whitespace-nowrap">Websites</span>
        </h1>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 w-fit bg-brand text-on-brand px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors"
        >
          <Plus size={16} />
          Add Website
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search websites (domain, company)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-ink focus:outline-none focus:border-brand"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-surface border border-border text-ink rounded-lg hover:bg-border/50">
          Search
        </button>
      </form>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-ink">Domain</th>
                <th className="px-6 py-4 font-semibold text-ink">Company</th>
                <th className="px-6 py-4 font-semibold text-ink">Category</th>
                <th className="px-6 py-4 font-semibold text-ink text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="px-6 py-4 text-ink font-medium">{item.domain}</td>
                  <td className="px-6 py-4 text-muted">{item.company_name}</td>
                  <td className="px-6 py-4 text-muted">{item.category_label}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted">No Websites found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-canvas">
            <span className="text-sm text-muted">
              Showing page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-border rounded-lg hover:bg-surface disabled:opacity-50 text-ink"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-border rounded-lg hover:bg-surface disabled:opacity-50 text-ink"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-4xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <LinkIcon className="text-brand-dark" size={24} />
                {editingId === 'new' ? 'Add Website' : 'Edit Website'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Domain</label>
                    <input
                      type="text"
                      required
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                      placeholder="e.g. example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                      placeholder="e.g. Example Inc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Category Label</label>
                    <input
                      type="text"
                      value={formData.category_label}
                      onChange={(e) => setFormData({ ...formData, category_label: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Emails (comma separated)</label>
                    <input
                      type="text"
                      value={formData.emails}
                      onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Contact Info</label>
                  <textarea
                    rows={2}
                    value={formData.contact_info}
                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-4 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Twitter URL</label>
                    <input
                      type="text"
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">YouTube URL</label>
                    <input
                      type="text"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">GitHub URL</label>
                    <input
                      type="text"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">TikTok URL</label>
                    <input
                      type="text"
                      value={formData.tiktok_url}
                      onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-muted mb-1">Source URL</label>
                    <input
                      type="text"
                      value={formData.source_url}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-2">
                  <label className="block text-sm font-medium text-ink mb-1">Rank</label>
                  <input
                    type="number"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) || 0 })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Technologies Used</label>
                  
                  {/* Selected Technologies Pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.technology_ids.map(techId => {
                      const tech = technologies.find(t => t.id === techId)
                      if (!tech) return null
                      return (
                        <div key={tech.id} className="flex items-center gap-1 bg-surface border border-border px-2.5 py-1 rounded-full text-sm text-ink">
                          <span>{tech.name}</span>
                          <button
                            type="button"
                            onClick={() => handleTechToggle(tech.id)}
                            className="text-muted hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })}
                    {formData.technology_ids.length === 0 && (
                      <span className="text-sm text-muted">No technologies selected.</span>
                    )}
                  </div>

                  {/* Add Technology Dropdown */}
                  <SearchableDropdown
                    options={technologies
                      .filter(tech => !formData.technology_ids.includes(tech.id))
                      .map(tech => ({ value: tech.id, label: tech.name }))}
                    value=""
                    onChange={(val) => {
                      if (val) {
                        handleTechToggle(parseInt(val))
                      }
                    }}
                    placeholder="+ Add a technology..."
                    createNewText="+ Create New Technology"
                    onCreateNew={async (techName) => {
                      try {
                        const slug = techName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        
                        const newTech = await adminTechnologies.create({ 
                          name: techName, 
                          slug: slug, 
                          icon: 'globe', 
                          icon_color: '#FF6B35',
                          is_featured: false,
                          is_popular: false,
                          sort_order: 0
                        });
                        
                        handleTechToggle(newTech.id);
                        
                        fetchData();
                      } catch (err) {
                        alert("Failed to create technology: " + err.message);
                      }
                    }}
                  />
                </div>

              </div>

              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0 bg-canvas">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-ink bg-surface border border-border rounded-lg hover:bg-border/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-brand bg-brand rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId === 'new' ? 'Create Website' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}




