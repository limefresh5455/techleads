import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Plus, Check } from 'lucide-react'

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  onCreateNew,
  createNewText = "+ Create New"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newValue, setNewValue] = useState('')
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsCreating(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedOption = options.find(opt => opt.value === value)

  const handleCreate = async () => {
    if (!newValue.trim()) return
    if (onCreateNew) {
      await onCreateNew(newValue.trim())
      setNewValue('')
      setIsCreating(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="flex items-center justify-between w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink cursor-pointer hover:border-brand transition-colors"
        onClick={() => {
          setIsOpen(!isOpen)
          setIsCreating(false)
          setSearch('')
        }}
      >
        <span className={selectedOption ? 'text-ink' : 'text-muted'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
          {isCreating ? (
            <div className="p-3">
              <div className="text-sm font-semibold text-ink mb-2">{createNewText}</div>
              <input
                type="text"
                autoFocus
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCreate()
                  }
                }}
                className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand mb-2"
                placeholder="Enter name..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-ink bg-surface border border-border rounded hover:bg-border/50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-3 py-1.5 text-xs text-on-brand bg-brand rounded hover:bg-brand/90 font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col max-h-64">
              <div className="p-2 border-b border-border shrink-0 relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-canvas border border-border rounded-md pl-8 pr-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                />
              </div>
              
              <div className="overflow-y-auto flex-1 p-1">
                {onCreateNew && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10 rounded-md transition-colors"
                  >
                    <Plus size={16} />
                    {createNewText}
                  </button>
                )}

                {filteredOptions.length > 0 ? (
                  filteredOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-canvas rounded-md transition-colors"
                    >
                      <span>{opt.label}</span>
                      {value === opt.value && <Check size={16} className="text-brand" />}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-muted">
                    No results found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


