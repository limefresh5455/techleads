import PageHero from '../components/PageHero'

export default function LegalPage({ title, body }) {
  return (
    <>
      <PageHero title={title} subtitle="LeadIntel.Ai legal information." ctaLabel={false}/>
      <section className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-muted lg:px-6">
        {body.map((p) => (
          <p key={p} className="mb-4">
            {p}
          </p>
        ))}
      </section>
    </>
  )
}
