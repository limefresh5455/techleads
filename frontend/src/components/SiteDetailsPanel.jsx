import { BarChart3, ExternalLink, Globe, Tag, X } from 'lucide-react'

function TechPill({ name, color }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-ink"
    >
      <span
        className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold text-white"
        style={{ backgroundColor: color || '#FF6B35' }}
      >
        {name.slice(0, 1)}
      </span>
      {name}
    </span>
  )
}

export default function SiteDetailsPanel({ site, loading, onClose }) {
  if (loading) {
    return (
      <aside className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <p className="text-sm text-muted">Loading site details…</p>
      </aside>
    )
  }

  if (!site) return null

  const socials = [
    { label: 'Facebook', url: site.facebook_url },
    { label: 'Twitter', url: site.twitter_url },
    { label: 'LinkedIn', url: site.linkedin_url },
  ].filter((s) => s.url)

  return (
    <aside className="rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">Site Details</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted hover:bg-surface hover:text-ink"
          aria-label="Close site details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
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
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-brand" />
            <span className="text-muted">Rank</span>
            <span className="font-bold text-brand">{site.rank}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-brand" />
            <span className="text-muted">Category</span>
            <span className="font-medium text-ink">{site.category_label}</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Description</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{site.description}</p>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Technologies</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {site.technologies.map((tech) => (
              <TechPill key={tech.id} name={tech.name} color={tech.icon_color} />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            All Detected Technologies
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {site.all_detected_technologies.map((name) => (
              <span
                key={name}
                className="rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs font-medium text-brand"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Contact Information
          </p>
          <p className="mt-2 text-sm text-muted">{site.contact_info}</p>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Social Media</p>
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
        </div>
      </div>
    </aside>
  )
}
