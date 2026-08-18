import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

export default function ToolsPage() {
  const { data } = useSiteData()
  const tools = data.free_tools || []

  return (
    <>
      <PageHero
        title="Free Tools"
        subtitle="Detect themes, CMS platforms, and Shopify apps — free technology checkers from TechLeads.Ai."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="rounded-2xl border border-border bg-white p-6 transition hover:border-brand/40 hover:shadow-sm"
            >
              <h2 className="text-lg font-bold text-ink">{item.name}</h2>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
