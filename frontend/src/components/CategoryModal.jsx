import { useMemo, useState } from 'react'

export default function CategoryModal({ isOpen, onClose, categoryOptions, selectedCategory, onSelectCategory }) {
  const [categorySearch, setCategorySearch] = useState('')

  const modalCategories = useMemo(() => {
    if (!categorySearch.trim()) return categoryOptions
    const q = categorySearch.trim().toLowerCase()
    return categoryOptions.filter((cat) => cat.name.toLowerCase().includes(q))
  }, [categoryOptions, categorySearch])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-ink">All Categories</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="border-b border-border p-4">
          <input
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 overflow-y-auto p-4">
          {modalCategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                onSelectCategory(cat.slug)
                onClose()
              }}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                selectedCategory === cat.slug
                  ? 'border-brand bg-brand text-on-brand'
                  : 'border-border text-ink hover:bg-surface'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
