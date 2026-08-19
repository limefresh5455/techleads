import { BarChart3, Brain, ExternalLink, Globe, Sparkles, Tag, X } from 'lucide-react'

function TechPill({ name, color, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Show sites using ${name}`}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm ${
        active
          ? 'border-brand bg-brand/15 text-ink'
          : 'border-border bg-white text-ink'
      }`}
    >
      <span
        className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold text-ink"
        style={{ backgroundColor: color || '#FFD23F' }}
      >
        {name.slice(0, 1)}
      </span>
      {name}
    </button>
  )
}

function ChipList({ items, variant = 'default', activeNames = [], onItemClick }) {
  if (!items?.length) return <p className="mt-2 text-sm text-muted">Not detected</p>
  const base =
    variant === 'brand'
      ? 'rounded-full border px-2.5 py-1 text-xs font-medium transition hover:-translate-y-0.5'
      : 'rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:-translate-y-0.5'
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = activeNames.some((n) => n.toLowerCase() === String(item).toLowerCase())
        const cls =
          variant === 'brand'
            ? active
              ? `${base} border-brand bg-brand text-ink`
              : `${base} border-brand/20 bg-brand/5 text-ink hover:border-brand hover:bg-brand/15`
            : active
              ? `${base} border-brand bg-brand/15 text-ink`
              : `${base} border-border bg-surface text-ink hover:border-brand`
        return (
          <button
            key={item}
            type="button"
            onClick={() => onItemClick?.(item)}
            title={`Show sites using ${item}`}
            className={cls}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      {children}
    </div>
  )
}

export default function SiteDetailsPanel({
  site,
  loading,
  enriching,
  onClose,
  onRefresh,
  onTechnologyClick,
  activeTechSlugs = [],
  activeTechNames = [],
}) {
  if (loading || enriching) {
    return (
      <aside className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Sparkles className="h-4 w-4 animate-pulse text-brand" />
          {enriching ? 'Enriching with AI…' : 'Loading site details…'}
        </div>
      </aside>
    )
  }

  if (!site) return null

  const socials = [
    { label: 'Facebook', url: site.facebook_url },
    { label: 'Twitter', url: site.twitter_url },
    { label: 'LinkedIn', url: site.linkedin_url },
    { label: 'Instagram', url: site.instagram_url },
    { label: 'YouTube', url: site.youtube_url },
  ].filter((s) => s.url)

  return (
    <aside className="rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">Site Details</h3>
          {site.llm_used ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-ink">
              <Brain className="h-3 w-3" />
              {site.llm_provider === 'openrouter' ? 'gpt-oss' : 'AI Enriched'}
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Rule-based
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg px-2 py-1 text-xs font-medium text-brand hover:bg-brand/5"
            >
              Re-enrich
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface hover:text-ink"
            aria-label="Close site details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
        {site.llm_used && site.llm_model ? (
          <p className="mb-3 rounded-lg bg-surface px-3 py-2 text-[11px] text-muted">
            Model: <span className="font-medium text-ink">{site.llm_model}</span>
          </p>
        ) : null}
        <h4 className="text-lg font-bold text-ink">{site.title}</h4>
        <a
          href={`https://${site.domain}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <Globe className="h-3.5 w-3.5" />
          {site.domain}
          <ExternalLink className="h-3 w-3" />
        </a>

        <div className="mt-4 rounded-xl bg-brand/5 p-3">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand" />
              <span className="text-muted">Rank</span>
              <span className="font-bold text-brand">{site.rank}</span>
              {site.confidence_score > 0 ? (
                <span className="ml-auto text-xs text-muted">Confidence {site.confidence_score}%</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-brand" />
              <span className="text-muted">Category</span>
              <span className="font-medium text-ink">{site.category_label}</span>
            </div>
            {site.industry ? (
              <div className="flex items-center gap-2">
                <span className="text-muted">Industry</span>
                <span className="font-medium text-ink">{site.industry}</span>
              </div>
            ) : null}
            {site.company_type ? (
              <div className="flex items-center gap-2">
                <span className="text-muted">Type</span>
                <span className="font-medium text-ink">{site.company_type}</span>
              </div>
            ) : null}
            {site.estimated_traffic_tier ? (
              <div className="flex items-center gap-2">
                <span className="text-muted">Traffic</span>
                <span className="font-medium text-ink">{site.estimated_traffic_tier}</span>
              </div>
            ) : null}
          </div>
        </div>

        {!site.llm_used && site.llm_error ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            AI enrichment unavailable: {site.llm_error}. Using crawl signals only.
          </p>
        ) : null}

        {site.business_summary ? (
          <Section title="Business Summary">
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{site.business_summary}</p>
          </Section>
        ) : null}

        <Section title="Description">
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{site.description}</p>
        </Section>

        {site.llm_insights?.length > 0 ? (
          <Section title="AI Insights">
            <ul className="mt-2 space-y-2">
              {site.llm_insights.map((insight) => (
                <li key={insight} className="flex gap-2 text-sm text-ink/80">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section title="Primary Technologies">
          <p className="mt-1 text-[11px] text-muted">Click a technology to filter the sites table</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {site.technologies?.length ? (
              site.technologies.map((tech) => (
                <TechPill
                  key={tech.id}
                  name={tech.name}
                  color={tech.icon_color}
                  active={activeTechSlugs.includes(tech.slug)}
                  onClick={() => onTechnologyClick?.(tech)}
                />
              ))
            ) : (
              <p className="text-sm text-muted">Not detected</p>
            )}
          </div>
        </Section>

        <Section title="All Detected Technologies">
          <p className="mt-1 text-[11px] text-muted">Click a technology to filter the sites table</p>
          <ChipList
            items={site.all_detected_technologies}
            variant="brand"
            activeNames={activeTechNames}
            onItemClick={(name) => onTechnologyClick?.({ name })}
          />
        </Section>

        {site.cms_platform || site.ecommerce_platform || site.hosting_cdn ? (
          <Section title="Platform Stack">
            <div className="mt-2 space-y-1 text-sm text-ink/80">
              {site.cms_platform ? (
                <p>
                  <span className="text-muted">CMS:</span>{' '}
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => onTechnologyClick?.({ name: site.cms_platform })}
                  >
                    {site.cms_platform}
                  </button>
                </p>
              ) : null}
              {site.ecommerce_platform ? (
                <p>
                  <span className="text-muted">E-commerce:</span>{' '}
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => onTechnologyClick?.({ name: site.ecommerce_platform })}
                  >
                    {site.ecommerce_platform}
                  </button>
                </p>
              ) : null}
              {site.hosting_cdn ? (
                <p>
                  <span className="text-muted">Hosting/CDN:</span>{' '}
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => onTechnologyClick?.({ name: site.hosting_cdn })}
                  >
                    {site.hosting_cdn}
                  </button>
                </p>
              ) : null}
            </div>
          </Section>
        ) : null}

        <Section title="Marketing Stack">
          <ChipList
            items={site.marketing_stack}
            activeNames={activeTechNames}
            onItemClick={(name) => onTechnologyClick?.({ name })}
          />
        </Section>

        <Section title="Analytics & Tracking">
          <ChipList
            items={site.analytics_tools}
            activeNames={activeTechNames}
            onItemClick={(name) => onTechnologyClick?.({ name })}
          />
        </Section>

        {site.payment_providers?.length > 0 ? (
          <Section title="Payments">
            <ChipList
              items={site.payment_providers}
              activeNames={activeTechNames}
              onItemClick={(name) => onTechnologyClick?.({ name })}
            />
          </Section>
        ) : null}

        {site.key_features?.length > 0 ? (
          <Section title="Key Features">
            <ChipList items={site.key_features} />
          </Section>
        ) : null}

        {site.target_audience ? (
          <Section title="Target Audience">
            <p className="mt-2 text-sm text-ink/80">{site.target_audience}</p>
          </Section>
        ) : null}

        <Section title="Contact Information">
          <p className="mt-2 text-sm text-ink/80">{site.contact_info}</p>
          {site.phone ? <p className="mt-1 text-sm text-ink/80">{site.phone}</p> : null}
          {site.address ? <p className="mt-1 text-sm text-muted">{site.address}</p> : null}
        </Section>

        <Section title="Social Media">
          {socials.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:border-brand hover:text-brand"
                >
                  {social.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">No social profiles detected.</p>
          )}
        </Section>
      </div>
    </aside>
  )
}
