import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

export default function Pricing({ plans = [], content, showHeader = true }) {
  const [yearly, setYearly] = useState(true)
  const [leads, setLeads] = useState(10000)

  useEffect(() => {
    if (content?.calculator_default_leads) {
      setLeads(content.calculator_default_leads)
    }
  }, [content])

  const estimate = useMemo(() => {
    const base = yearly ? 0.045 : 0.059
    return Math.max(49, Math.round(leads * base))
  }, [leads, yearly])

  if (!content) return null

  return (
    <section id="pricing" className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              {content.pricing_title}
            </h2>
            <p className="mt-3 text-muted">{content.pricing_subtitle}</p>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-surface p-1">
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  !yearly ? 'bg-ink text-white' : 'text-muted'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  yearly ? 'bg-ink text-white' : 'text-muted'
                }`}
              >
                Yearly <span className="ml-1 text-brand">{content.pricing_yearly_badge}</span>
              </button>
            </div>
          </div>
        )}

        {!showHeader && (
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface p-1">
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  !yearly ? 'bg-ink text-white' : 'text-muted'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  yearly ? 'bg-ink text-white' : 'text-muted'
                }`}
              >
                Yearly <span className="ml-1 text-brand">{content.pricing_yearly_badge}</span>
              </button>
            </div>
          </div>
        )}

        <div className={`${showHeader ? 'mt-10' : ''} grid gap-5 lg:grid-cols-3`}>
          {plans.map((plan) => {
            const price = yearly ? plan.yearly_price : plan.monthly_price
            const period = yearly ? '/yr' : '/mo'
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.is_popular
                    ? 'border-ink bg-ink text-white shadow-xl scale-[1.02]'
                    : 'border-border bg-white text-ink'
                }`}
              >
                {plan.is_popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-ink">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className={`mt-1 text-sm ${plan.is_popular ? 'text-white/70' : 'text-muted'}`}>
                  {plan.description}
                </p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-extrabold">
                    {price === 0 ? '$0' : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className={`mb-1 text-sm ${plan.is_popular ? 'text-white/60' : 'text-muted'}`}>
                      {period}
                    </span>
                  )}
                </div>
                <p className={`mt-1 text-sm ${plan.is_popular ? 'text-white/60' : 'text-muted'}`}>
                  {plan.credits.toLocaleString()} credits included
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.id} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className={plan.is_popular ? 'text-white/90' : 'text-ink/80'}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/get-started"
                  className={`mt-8 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 ${
                    plan.is_popular
                      ? 'bg-brand text-ink shadow-md shadow-brand/30 hover:bg-brand-dark'
                      : 'border border-border bg-white text-ink hover:border-brand hover:text-ink'
                  }`}
                >
                  {plan.cta_label}
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-surface p-6 md:p-8">
          <h3 className="text-lg font-bold text-ink">{content.calculator_title}</h3>
          <p className="mt-1 text-sm text-muted">{content.calculator_subtitle}</p>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={leads}
            onChange={(e) => setLeads(Number(e.target.value))}
            className="mt-6 w-full accent-brand"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <span className="font-semibold text-ink">{leads.toLocaleString()}</span> leads / month
            </p>
            <p className="text-2xl font-extrabold text-ink">
              ${estimate}
              <span className="text-sm font-medium text-muted">
                {yearly ? '/yr est.' : '/mo est.'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
