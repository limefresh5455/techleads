import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Loader2 } from 'lucide-react'
import { createCheckoutSession } from '../api'
import { useSiteData } from '../context/SiteDataContext'

export default function Pricing({ plans = [], content, showHeader = true }) {
  const { user } = useSiteData()
  const navigate = useNavigate()
  const [buyingSlug, setBuyingSlug] = useState('')
  const [error, setError] = useState('')

  const estimate = useMemo(() => {
    const growth = plans.find((p) => p.slug === 'growth')
    if (!growth || !growth.credits) return { credits: 500, price: 49 }
    return { credits: growth.credits, price: growth.monthly_price }
  }, [plans])

  if (!content) return null

  async function buyPlan(plan) {
    setError('')
    if (plan.slug === 'enterprise' || plan.monthly_price <= 0 || plan.credits <= 0) {
      navigate('/contact')
      return
    }
    if (!user) {
      navigate('/login?redirect=/pricing')
      return
    }
    setBuyingSlug(plan.slug)
    try {
      const session = await createCheckoutSession(plan.slug)
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
    <section id="pricing" className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              {content.pricing_title}
            </h2>
            <p className="mt-3 text-muted">{content.pricing_subtitle}</p>
          </div>
        )}

        {error ? (
          <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className={`${showHeader ? 'mt-10' : ''} grid gap-5 md:grid-cols-2 xl:grid-cols-4`}>
          {plans.map((plan) => {
            const isCustom = plan.slug === 'enterprise' || plan.monthly_price <= 0
            const buying = buyingSlug === plan.slug
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.is_popular
                    ? 'border-brand bg-ink text-white shadow-xl shadow-brand/20'
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
                <div className="mt-5">
                  {isCustom ? (
                    <span className="text-4xl font-extrabold">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold">${plan.monthly_price}</span>
                      <p className={`mt-1 text-sm font-semibold ${plan.is_popular ? 'text-brand' : 'text-brand'}`}>
                        {plan.credits.toLocaleString()} credits
                      </p>
                    </>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.id} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className={plan.is_popular ? 'text-white/90' : 'text-ink/80'}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={buying}
                  onClick={() => buyPlan(plan)}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-60 ${
                    plan.is_popular
                      ? 'bg-brand text-ink hover:bg-brand-dark'
                      : 'border border-border bg-white text-ink hover:border-brand'
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
            Example: Growth pack gives{' '}
            <span className="font-semibold">{estimate.credits.toLocaleString()} credits</span> for $
            {estimate.price} — enough for about {estimate.credits.toLocaleString()} technology CSV
            exports (1 credit per technology).
          </p>
          <Link to="/pricing" className="mt-4 inline-flex text-sm font-semibold text-brand hover:underline">
            Compare all credit packs →
          </Link>
        </div>
      </div>
    </section>
  )
}
