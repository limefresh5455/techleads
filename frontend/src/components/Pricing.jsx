import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Loader2 } from 'lucide-react'
import { createCheckoutSession } from '../api'
import { useSiteData } from '../context/SiteDataContext'

const BULK_QTY_OPTIONS = [1, 5, 10, 25, 100]

export default function Pricing({ plans = [], content, showHeader = true }) {
  const { user } = useSiteData()
  const navigate = useNavigate()
  const [buyingSlug, setBuyingSlug] = useState('')
  const [bulkQty, setBulkQty] = useState(1)
  const [error, setError] = useState('')

  const ordered = useMemo(() => {
    const bySlug = Object.fromEntries(plans.map((p) => [p.slug, p]))
    const preferred = [bySlug.bulk, bySlug.growth, bySlug.business].filter(Boolean)
    return preferred.length ? preferred : plans.slice(0, 3)
  }, [plans])

  const estimate = useMemo(() => {
    const growth = plans.find((p) => p.slug === 'growth')
    if (!growth || !growth.credits) return { credits: 5000, price: 79 }
    return { credits: growth.credits, price: growth.monthly_price }
  }, [plans])

  if (!content) return null

  async function buyPlan(plan, quantity = 1) {
    setError('')
    if (plan.monthly_price <= 0 || plan.credits <= 0) {
      navigate('/contact')
      return
    }
    if (!user) {
      navigate('/login?redirect=/pricing')
      return
    }
    setBuyingSlug(plan.slug)
    try {
      const session = await createCheckoutSession(plan.slug, quantity)
      if (session.session_id) {
        localStorage.setItem('tl_pending_checkout', session.session_id)
      }
      window.location.href = session.checkout_url
    } catch (err) {
      setError(err.message || 'Unable to start checkout')
      setBuyingSlug('')
    }
  }

  return (
    <section id="pricing" className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              {content.pricing_title || 'Simple, transparent pricing'}
            </h2>
            <p className="mt-3 text-muted">{content.pricing_subtitle}</p>
          </div>
        )}

        {error ? (
          <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className={`${showHeader ? 'mt-10' : ''} grid gap-5 lg:grid-cols-3`}>
          {ordered.map((plan) => {
            const isBulk = plan.slug === 'bulk'
            const buying = buyingSlug === plan.slug
            const qty = isBulk ? bulkQty : 1
            const total = plan.monthly_price * qty
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border p-6 ${
                  plan.is_popular
                    ? 'border-brand bg-card shadow-xl shadow-brand/15 ring-1 ring-brand/30'
                    : 'border-border bg-card'
                }`}
              >
                {plan.is_popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-on-brand">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted">{plan.description}</p>

                {isBulk ? (
                  <div className="mt-5">
                    <select
                      value={bulkQty}
                      onChange={(e) => setBulkQty(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold outline-none focus:border-brand"
                    >
                      {BULK_QTY_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n} Technolog{n === 1 ? 'y' : 'ies'} · ${plan.monthly_price}/each
                        </option>
                      ))}
                    </select>
                    <p className="mt-4 text-4xl font-extrabold text-ink">${total}</p>
                    <p className="mt-1 text-sm font-semibold text-brand">one-time</p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <span className="text-4xl font-extrabold text-ink">${plan.monthly_price}</span>
                    <p className="mt-1 text-sm font-semibold text-brand">
                      {plan.credits.toLocaleString()} credits · one-time
                    </p>
                  </div>
                )}

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.id} className="flex items-start gap-2 text-sm text-ink/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      {f.label}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={buying}
                  onClick={() => buyPlan(plan, qty)}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-60 ${
                    plan.is_popular
                      ? 'bg-brand text-on-brand hover:bg-brand-dark'
                      : 'border border-border bg-card text-ink hover:border-brand'
                  }`}
                >
                  {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {buying ? 'Redirecting…' : plan.cta_label}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-surface p-6 md:p-8">
          <h3 className="text-lg font-bold text-ink">{content.calculator_title}</h3>
          <p className="mt-1 text-sm text-muted">{content.calculator_subtitle}</p>
          <p className="mt-4 text-sm text-ink/80">
            Example: Growth gives{' '}
            <span className="font-semibold">{estimate.credits.toLocaleString()} credits</span> for $
            {estimate.price} — enough for {estimate.credits.toLocaleString()} technology exports (1
            credit each). Bulk starts at <span className="font-semibold">$29 / technology</span>.
          </p>
          <Link to="/pricing" className="mt-4 inline-flex text-sm font-semibold text-brand hover:underline">
            Compare all plans →
          </Link>
        </div>
      </div>
    </section>
  )
}
