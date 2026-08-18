import PageHero from '../components/PageHero'

const POSTS = [
  {
    title: 'How to find WhatsApp Business websites',
    summary: 'Use technology signals to build high-intent outreach lists.',
  },
  {
    title: 'Shopify lead generation playbook',
    summary: 'Target growing ecommerce brands with the right tech stack filters.',
  },
  {
    title: 'Why tech intelligence beats firmographics alone',
    summary: 'Combine installed tools with company data for better conversion.',
  },
]

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="Blog"
        subtitle="Guides, product updates, and lead generation strategies from TechLeads.Ai."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {POSTS.map((post) => (
            <article key={post.title} className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-bold text-ink">{post.title}</h2>
              <p className="mt-2 text-sm text-muted">{post.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
