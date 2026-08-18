import { Link } from 'react-router-dom'
import { ArrowRight, Puzzle } from 'lucide-react'
import { Icon } from './icons'

export default function Features({ features = [], content }) {
  if (!content) return null

  return (
    <section id="features" className="bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {content.features_title}
          </h2>
          <p className="mt-3 text-muted">{content.features_subtitle}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.id} className="rounded-2xl border border-border bg-white p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon name={f.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
              <Link
                to="/technologies"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:gap-2 transition-all"
              >
                {f.link_label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div
          id="tools"
          className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-ink p-6 text-white md:flex-row md:items-center md:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
              <Puzzle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{content.extension_title}</h3>
              <p className="mt-1 max-w-xl text-sm text-white/70">{content.extension_description}</p>
            </div>
          </div>
          <Link
            to={content.extension_cta_href || '/products/chrome-extension'}
            className="shrink-0 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {content.extension_cta_label}
          </Link>
        </div>
      </div>
    </section>
  )
}
