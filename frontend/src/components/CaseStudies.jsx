export default function CaseStudies({ content, caseStudies = [] }) {
  if (!content) return null

  return (
    <section id="case-studies" className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">
          {content.case_studies_eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-ink md:text-3xl">
          {content.case_studies_title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted">{content.case_studies_subtitle}</p>

        <div className="mt-10 grid gap-5 text-left md:grid-cols-3">
          {caseStudies.map((study) => (
            <article
              key={study.id}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-ink">{study.company}</h3>
                <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                  {study.metric}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">{study.title}</p>
              <p className="mt-2 text-sm text-muted">{study.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
