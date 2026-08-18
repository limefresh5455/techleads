import PageHero from '../components/PageHero'

export default function LegalPage({ title, body }) {
  return (
    <>
      <PageHero title={title} subtitle="TechLeads.Ai legal information." ctaTo="/contact" ctaLabel="Contact us" />
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
