import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ExternalLink,
  Filter,
  Loader2,
  Search,
} from 'lucide-react'
import { detectUrl, exportDashboard, fetchDashboardSearch, fetchWebsiteDetail } from '../api'
import { useSiteData } from '../context/SiteDataContext'
import SiteDetailsPanel from '../components/SiteDetailsPanel'
import CreditsPanel from '../components/CreditsPanel'

function TechBadge({ tech }) {
  return (
    <span
      className="grid h-7 w-7 place-items-center rounded-full border border-border bg-white text-[10px] font-bold text-white"
      style={{ backgroundColor: tech.icon_color }}
      title={tech.name}
    >
      {tech.name.slice(0, 1)}
    </span>
  )
}

export default function DashboardPage() {
  const { data, updateUserCredits } = useSiteData()
  const [searchParams, setSearchParams] = useSearchParams()
  const technologies = data.technologies || []
  const categories = data.categories || []

  const [domainQuery, setDomainQuery] = useState('')
  const [techSearch, setTechSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTechs, setSelectedTechs] = useState([])
  const [matchMode, setMatchMode] = useState('any')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [siteDetail, setSiteDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [analyzeUrl, setAnalyzeUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [exporting, setExporting] = useState(false)

  const categoryOptions = useMemo(() => {
    const seen = new Set()
    const items = [{ slug: 'all', name: 'All' }]
    for (const cat of categories) {
      if (!seen.has(cat.slug)) {
        seen.add(cat.slug)
        items.push({ slug: cat.slug, name: cat.name })
      }
    }
    return items
  }, [categories])

  const filteredTechnologies = useMemo(() => {
    let list = [...technologies]
    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory)
      if (cat) list = list.filter((t) => t.category_id === cat.id)
    }
    if (techSearch.trim()) {
      const q = techSearch.trim().toLowerCase()
      list = list.filter((t) => t.name.toLowerCase().includes(q))
    }
    return list.sort((a, b) => a.sort_order - b.sort_order)
  }, [technologies, categories, selectedCategory, techSearch])

  const loadResults = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await fetchDashboardSearch({
        q: domainQuery,
        technologies: selectedTechs,
        match: matchMode,
        page,
      })
      setResults(payload)
      if (typeof payload.user_credits === 'number') {
        updateUserCredits(payload.user_credits)
      }
    } catch (err) {
      setError(err.message || 'Failed to load results')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [domainQuery, selectedTechs, matchMode, page, updateUserCredits])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  const loadSiteDetail = useCallback(async (id, { refresh = true } = {}) => {
    setDetailLoading(true)
    if (refresh) setEnriching(true)
    setError('')
    try {
      const data = await fetchWebsiteDetail(id, { refresh })
      setSiteDetail(data)
    } catch (err) {
      setSiteDetail(null)
      setError(err.message || 'Failed to load site details')
    } finally {
      setDetailLoading(false)
      setEnriching(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSiteDetail(null)
      return
    }
    loadSiteDetail(selectedId, { refresh: true })
  }, [selectedId, loadSiteDetail])

  useEffect(() => {
    const siteParam = searchParams.get('site')
    if (siteParam) {
      setSelectedId(Number(siteParam))
    }
  }, [searchParams])

  async function onAnalyzeUrl(e) {
    e.preventDefault()
    if (!analyzeUrl.trim()) return
    setAnalyzing(true)
    setError('')
    try {
      const result = await detectUrl(analyzeUrl.trim())
      setSelectedId(result.website.id)
      setSiteDetail(result.website)
      setSearchParams({ site: String(result.website.id) })
      await loadResults()
    } catch (err) {
      setError(err.message || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  function toggleTech(slug) {
    setPage(1)
    setSelectedTechs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  function onDomainSearch(e) {
    e.preventDefault()
    setPage(1)
    loadResults()
  }

  function handleView(row) {
    if (selectedId === row.id) {
      setSelectedId(null)
      setSiteDetail(null)
      return
    }
    setSelectedId(row.id)
  }

  function closeDetails() {
    setSelectedId(null)
    setSiteDetail(null)
  }

  async function exportCsv() {
    if (!results?.items?.length) return
    setExporting(true)
    setError('')
    try {
      const freeLimit = results.free_limit ?? 10
      const limit = Math.min(results.items.length, freeLimit)
      const payload = await exportDashboard({
        q: domainQuery,
        technologies: selectedTechs,
        match: matchMode,
        limit,
      })
      const header = ['Domain', 'Rank', 'Technologies']
      const rows = payload.rows.map((row) => [
        row.domain,
        row.rank,
        row.technologies.map((t) => t.name).join('; '),
      ])
      const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'techleads-export.csv'
      a.click()
      URL.revokeObjectURL(url)
      setResults((prev) => (prev ? { ...prev, user_credits: payload.user_credits } : prev))
      updateUserCredits(payload.user_credits)
    } catch (err) {
      setError(err.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const maxPage = results?.max_page ?? 1
  const totalPages = maxPage
  const start = results ? (results.page - 1) * results.page_size + 1 : 0
  const end = results ? Math.min(results.page * results.page_size, results.total_filtered) : 0

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6">
      <form onSubmit={onAnalyzeUrl} className="mb-6 flex max-w-2xl gap-2">
        <input
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          placeholder="Analyze any website URL…"
          value={analyzeUrl}
          onChange={(e) => setAnalyzeUrl(e.target.value)}
        />
        <button
          type="submit"
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {analyzing ? 'Analyzing…' : 'Detect'}
        </button>
      </form>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        {/* Filters */}
        <aside className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          <form onSubmit={onDomainSearch} className="mt-4 flex gap-2">
            <input
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="shop, gym..."
              value={domainQuery}
              onChange={(e) => setDomainQuery(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-brand px-3 py-2 text-white hover:bg-brand-dark"
              aria-label="Search domains"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Filter mode</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: 'any', label: 'Match any' },
                { id: 'all', label: 'Match all' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setMatchMode(mode.id)
                    setPage(1)
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                    matchMode === mode.id
                      ? 'border-brand bg-brand text-white'
                      : 'border-border text-ink hover:bg-surface'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              {matchMode === 'any'
                ? 'Sites using at least one selected technology.'
                : 'Sites using all selected technologies.'}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Technologies</p>
            <input
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="Search technologies..."
              value={techSearch}
              onChange={(e) => setTechSearch(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    selectedCategory === cat.slug
                      ? 'border-brand bg-brand text-white'
                      : 'border-border text-ink hover:bg-surface'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
              {filteredTechnologies.map((tech) => {
                const checked = selectedTechs.includes(tech.slug)
                return (
                  <label
                    key={tech.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface ${
                      checked ? 'bg-brand/5' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTech(tech.slug)}
                      className="accent-brand"
                    />
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: tech.icon_color }}
                    >
                      {tech.name.slice(0, 1)}
                    </span>
                    <span className="text-ink">{tech.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="min-w-0">
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm text-muted">
              <span>
                {results
                  ? `${start.toLocaleString()} - ${end.toLocaleString()} of ${results.total_filtered.toLocaleString()} results`
                  : 'Loading results…'}
              </span>
              <span>sorted by Rank</span>
            </div>

            {error && (
              <p className="px-4 py-6 text-center text-sm text-red-600">{error}</p>
            )}

            {!error && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface/50 text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Domain</th>
                      <th className="px-4 py-3 font-semibold">Tech Stack</th>
                      <th className="px-4 py-3 font-semibold">Rank</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted">
                          Loading…
                        </td>
                      </tr>
                    )}
                    {!loading && results?.items?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted">
                          No websites match your filters.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      results?.items?.map((row) => (
                        <tr
                          key={row.id}
                          className={`border-b border-border/70 last:border-0 ${
                            selectedId === row.id ? 'bg-brand/5' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="grid h-7 w-7 place-items-center rounded-full bg-surface text-xs font-bold text-muted">
                                {row.domain.slice(0, 1).toUpperCase()}
                              </span>
                              <span className="font-medium text-ink">{row.domain}</span>
                              <a
                                href={`https://${row.domain}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted hover:text-brand"
                                aria-label={`Open ${row.domain}`}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {row.technologies.map((tech) => (
                                <TechBadge key={tech.id} tech={tech} />
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-brand">{row.rank}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleView(row)}
                              className="font-semibold text-brand hover:underline"
                            >
                              {selectedId === row.id ? 'Close' : 'View'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
              <span className="text-sm text-muted">
                Page {results?.page || 1} of {totalPages}
                {results && results.total_filtered > (results.free_limit ?? 10) && (
                  <span className="ml-1 text-xs">· {results.total_filtered.toLocaleString()} total</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-brand px-2 text-sm font-semibold text-white">
                  {page}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                  title={
                    page >= totalPages && results?.user_credits === 0
                      ? 'Add credits to view more results'
                      : undefined
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right panel */}
        <aside className="space-y-4">
          <CreditsPanel results={results} onExport={exportCsv} exporting={exporting} />

          {selectedId ? (
            <SiteDetailsPanel
              site={siteDetail}
              loading={detailLoading}
              enriching={enriching}
              onClose={closeDetails}
              onRefresh={() => selectedId && loadSiteDetail(selectedId, { refresh: true })}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-ink">Summary</h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Showing now
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-ink">
                    {results?.items?.length?.toLocaleString() ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Total matches
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-amber-600">
                    {results ? results.total_filtered.toLocaleString() : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Database total
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-muted">
                    {results ? `${results.total_actual.toLocaleString()} (limited)` : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Filters applied
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-ink">
                    {results?.filters_applied ?? 0}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
