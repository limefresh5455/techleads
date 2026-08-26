import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ExternalLink,
  Filter,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { detectUrl, exportDashboard, fetchDashboardSearch, fetchWebsiteDetail, fetchTechnologies } from '../api'
import { useSiteData } from '../context/SiteDataContext'
import SiteDetailsPanel from '../components/SiteDetailsPanel'
import CreditsPanel from '../components/CreditsPanel'
import CategoryModal from '../components/CategoryModal'

function TechBadge({ tech }) {
  return (
    <span
      className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-[10px] font-bold text-white"
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
  const [remoteTechs, setRemoteTechs] = useState([])
  const [techOffset, setTechOffset] = useState(0)
  const [hasMoreTechs, setHasMoreTechs] = useState(true)
  const [isFetchingTechs, setIsFetchingTechs] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [techRefreshTick, setTechRefreshTick] = useState(0)

  const categoryOptions = useMemo(() => {
    const seen = new Set()
    const ranked = [...categories]
      .filter((cat) => cat.slug && cat.slug !== 'all')
      .sort((a, b) => {
        const byOrder = (a.sort_order ?? 0) - (b.sort_order ?? 0)
        if (byOrder !== 0) return byOrder
        return (b.item_count || 0) - (a.item_count || 0)
      })

    const top = []
    for (const cat of ranked) {
      if (seen.has(cat.slug)) continue
      seen.add(cat.slug)
      top.push({ slug: cat.slug, name: cat.name })
    }

    // Keep current selection visible if it falls outside the top 15.
    if (selectedCategory !== 'all' && !seen.has(selectedCategory)) {
      const selected = categories.find((c) => c.slug === selectedCategory)
      if (selected) top.push({ slug: selected.slug, name: selected.name })
    }

    return [{ slug: 'all', name: 'All' }, ...top]
  }, [categories, selectedCategory])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsFetchingTechs(true)
      try {
        const q = techSearch.trim()
        const rows = await fetchTechnologies(q, selectedCategory, 0, 50)
        if (!cancelled) {
          setRemoteTechs(rows)
          setTechOffset(rows.length)
          setHasMoreTechs(rows.length === 50)
        }
      } catch {
        if (!cancelled) {
          setRemoteTechs([])
          setHasMoreTechs(false)
        }
      } finally {
        if (!cancelled) setIsFetchingTechs(false)
      }
    }
    
    const timer = setTimeout(load, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [techSearch, selectedCategory, techRefreshTick])

  const loadMoreTechs = useCallback(async () => {
    if (isFetchingTechs || !hasMoreTechs) return
    setIsFetchingTechs(true)
    try {
      const q = techSearch.trim()
      const rows = await fetchTechnologies(q, selectedCategory, techOffset, 50)
      setRemoteTechs(prev => {
        const existingIds = new Set(prev.map(t => t.id))
        const newRows = rows.filter(r => !existingIds.has(r.id))
        return [...prev, ...newRows]
      })
      setTechOffset(prev => prev + rows.length)
      setHasMoreTechs(rows.length === 50)
    } catch {
      // ignore
    } finally {
      setIsFetchingTechs(false)
    }
  }, [techSearch, selectedCategory, techOffset, isFetchingTechs, hasMoreTechs])

  const filteredTechnologies = useMemo(() => {
    const list = [...remoteTechs]
    const selectedObjs = selectedTechs.map(slug => 
        list.find(t => t.slug === slug) || technologies.find(t => t.slug === slug)
    ).filter(Boolean)
    
    const unselectedList = list.filter(t => !selectedTechs.includes(t.slug))
    const merged = [...selectedObjs, ...unselectedList]
    
    const seen = new Set()
    const top = []
    for (const tech of merged) {
      const key = tech.slug || tech.id
      if (seen.has(key)) continue
      seen.add(key)
      top.push(tech)
    }
    return top
  }, [remoteTechs, selectedTechs, technologies])

  const handleTechScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadMoreTechs()
    }
  }

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
      setResults((prev) => {
        if (!prev || !prev.items) return prev
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === id ? { ...item, ...data } : item)),
        }
      })
      if (refresh) {
        setTechRefreshTick(t => t + 1)
      }
    } catch (err) {
      setSiteDetail(null)
      let msg = err.message || 'Failed to load site details'
      if (msg.toLowerCase().includes('timed out')) {
        msg = 'The analysis took too long to respond. Please try again.'
      } else if (msg.includes('AI enrichment failed')) {
        msg = 'We encountered a temporary issue while analyzing this website. Please try again.'
      }
      setError(msg)
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
      setTechRefreshTick(t => t + 1)
      await loadResults()
    } catch (err) {
      let msg = err.message || 'Analysis failed'
      if (msg.toLowerCase().includes('timed out')) {
        msg = 'The analysis took too long to respond. Please try again.'
      } else if (msg.includes('AI enrichment failed')) {
        msg = 'We encountered a temporary issue while analyzing this website. Please try again.'
      }
      setError(msg)
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

  function slugifyTech(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 180) || 'unknown'
  }

  function filterByTechnology(tech) {
    const name = tech?.name || ''
    const matched =
      technologies.find((t) => t.slug === tech?.slug) ||
      technologies.find((t) => t.name.toLowerCase() === name.toLowerCase())
    const slug = matched?.slug || tech?.slug || slugifyTech(name)
    if (!slug) return

    setPage(1)
    setSelectedCategory('all')
    setTechSearch(matched?.name || name)
    setSelectedTechs([slug])
    setMatchMode('any')
    // Keep details open; table updates via selectedTechs → loadResults
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
    const freeLimit = results.free_limit ?? 10
    if (selectedTechs.length > 0) {
      const cost = selectedTechs.length
      if ((results.user_credits ?? 0) < cost) {
        setError(`Need ${cost} credit${cost === 1 ? '' : 's'} to export ${cost} technolog${cost === 1 ? 'y' : 'ies'}.`)
        return
      }
    }
    setExporting(true)
    setError('')
    try {
      const payload = await exportDashboard({
        q: domainQuery,
        technologies: selectedTechs,
        match: matchMode,
      })

      const joinList = (value) => (Array.isArray(value) ? value.filter(Boolean).join('; ') : '')
      const cell = (value) => {
        const text = value == null ? '' : String(value)
        return `"${text.replace(/"/g, '""')}"`
      }

      const header = [
        'Domain',
        'Title',
        'Rank',
        'Category',
        'Subcategory',
        'Industry',
        'Company Type',
        'Traffic Tier',
        'Confidence',
        'Business Summary',
        'Description',
        'AI Insights',
        'Primary Technologies',
        'All Detected Technologies',
        'CMS',
        'E-commerce',
        'Hosting/CDN',
        'Marketing Stack',
        'Analytics Tools',
        'Payment Providers',
        'Key Features',
        'Target Audience',
        'Contact',
        'Phone',
        'Address',
        'Facebook',
        'Twitter',
        'LinkedIn',
        'Instagram',
        'YouTube',
        'AI Enriched',
        'AI Provider',
        'AI Model',
      ]

      const rows = payload.rows.map((row) => [
        row.domain,
        row.title,
        row.rank,
        row.category_label,
        row.subcategory,
        row.industry,
        row.company_type,
        row.estimated_traffic_tier,
        row.confidence_score,
        row.business_summary,
        row.description,
        joinList(row.llm_insights),
        joinList(row.technologies?.map((t) => t.name)),
        joinList(row.all_detected_technologies),
        row.cms_platform,
        row.ecommerce_platform,
        row.hosting_cdn,
        joinList(row.marketing_stack),
        joinList(row.analytics_tools),
        joinList(row.payment_providers),
        joinList(row.key_features),
        row.target_audience,
        row.contact_info,
        row.phone,
        row.address,
        row.facebook_url,
        row.twitter_url,
        row.linkedin_url,
        row.instagram_url,
        row.youtube_url,
        row.llm_used ? 'yes' : 'no',
        row.llm_provider,
        row.llm_model,
      ])

      const csv = [header, ...rows].map((r) => r.map(cell).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
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
  const accessible = results?.accessible_records ?? results?.total_filtered ?? 0
  const start = results && accessible > 0 ? (results.page - 1) * results.page_size + 1 : 0
  const end = results ? Math.min(results.page * results.page_size, accessible) : 0
  const previewOnly = selectedTechs.length === 0

  const activeTechNames = useMemo(
    () =>
      selectedTechs.map((slug) => {
        const match = technologies.find((t) => t.slug === slug)
        return match?.name || slug
      }),
    [selectedTechs, technologies],
  )

  const filteredCategoryOptions = useMemo(() => {
    const search = techSearch.trim().toLowerCase()
    if (!search) return categoryOptions
    return categoryOptions.filter((cat) => cat.name.toLowerCase().includes(search) || cat.slug === 'all')
  }, [categoryOptions, techSearch])

  const visibleCategories = useMemo(() => {
    const sliced = filteredCategoryOptions.slice(0, 10)
    if (selectedCategory !== 'all') {
      const isVisible = sliced.some((c) => c.slug === selectedCategory)
      if (!isVisible) {
        const selectedObj = filteredCategoryOptions.find((c) => c.slug === selectedCategory)
        if (selectedObj) {
          sliced.push(selectedObj)
        }
      }
    }
    return sliced
  }, [filteredCategoryOptions, selectedCategory])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6">
      <form onSubmit={onAnalyzeUrl} className="mb-6 flex max-w-2xl gap-2">
        <input
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand"
          placeholder="Analyze any website URL…"
          value={analyzeUrl}
          onChange={(e) => setAnalyzeUrl(e.target.value)}
        />
        <button
          type="submit"
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark disabled:opacity-60"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {analyzing ? 'Analyzing…' : 'Detect'}
        </button>
      </form>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        {/* Filters */}
        <aside className="self-start rounded-2xl border border-border bg-card p-4 shadow-sm">
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
              className="rounded-lg bg-brand px-3 py-2 text-on-brand hover:bg-brand-dark"
              aria-label="Search domains"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>



          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Technologies & Categories</p>
            <div className="relative mt-2">
              <input
                className={`w-full rounded-lg border border-border py-2 pl-3 text-sm outline-none focus:border-brand ${
                  techSearch ? 'pr-8' : 'pr-3'
                }`}
                placeholder="Search technologies or categories..."
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
              />
              {techSearch && (
                <button
                  type="button"
                  onClick={() => setTechSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {visibleCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    selectedCategory === cat.slug
                      ? 'border-brand bg-brand text-on-brand'
                      : 'border-border text-ink hover:bg-surface'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              {filteredCategoryOptions.length > 12 && (
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="rounded-full border border-brand bg-brand px-2.5 py-1 text-xs font-medium text-on-brand hover:opacity-90"
                >
                  View More
                </button>
              )}
              {(domainQuery || techSearch || selectedCategory !== 'all' || selectedTechs.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setDomainQuery('');
                    setTechSearch('');
                    setSelectedCategory('all');
                    setSelectedTechs([]);
                    setPage(1);
                  }}
                  className="rounded-full border border-red-500/50 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  Reset Filters
                </button>
              )}
            </div>
            <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1" onScroll={handleTechScroll}>
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
                      className="accent-brand shrink-0 mt-0.5"
                    />
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: tech.icon_color }}
                    >
                      {tech.name.slice(0, 1)}
                    </span>
                    <span className="text-ink break-words">{tech.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="min-w-0">
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm text-muted">
              <span>
                {results
                  ? previewOnly
                    ? `${start.toLocaleString()} - ${end.toLocaleString()} of first ${(results.free_limit ?? 10).toLocaleString()} free · ${results.total_filtered.toLocaleString()} total`
                    : `${start.toLocaleString()} - ${end.toLocaleString()} of ${results.total_filtered.toLocaleString()} results`
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
                            <div className="flex flex-wrap items-center gap-1.5">
                              {row.technologies.slice(0, 7).map((tech) => (
                                <TechBadge key={tech.id} tech={tech} />
                              ))}
                              {row.technologies.length > 7 && (
                                <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-semibold text-muted">
                                  +{row.technologies.length - 7}
                                </span>
                              )}
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
                {previewOnly && results && results.total_filtered > (results.free_limit ?? 10) ? (
                  <span className="ml-1 text-xs">
                    · select a technology to view all {results.total_filtered.toLocaleString()}
                  </span>
                ) : null}
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
                <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-brand px-2 text-sm font-semibold text-on-brand">
                  {page}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                  title={undefined}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right panel */}
        <aside className="space-y-4">
          <CreditsPanel
            results={results}
            onExport={exportCsv}
            exporting={exporting}
            selectedTechCount={selectedTechs.length}
          />

          {selectedId ? (
            <SiteDetailsPanel
              site={siteDetail}
              loading={detailLoading}
              enriching={enriching}
              onClose={closeDetails}
              onRefresh={() => selectedId && loadSiteDetail(selectedId, { refresh: true })}
              onTechnologyClick={filterByTechnology}
              activeTechSlugs={selectedTechs}
              activeTechNames={activeTechNames}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryOptions={filteredCategoryOptions}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  )
}
