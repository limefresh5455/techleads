import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ChevronDown, Loader2, Shield } from 'lucide-react'
import { confirmCheckoutSession, createCheckoutSession } from '../api'
import { useSiteData } from '../context/SiteDataContext'

const BULK_QTY_OPTIONS = [1, 5, 10, 25, 100]

const COMPARISON = [
  {
    feature: 'Results per search',
    bulk: 'One-time dataset',
    growth: 'Unlimited browsing',
    business: 'Unlimited browsing',
  },
  {
    feature: 'Technologies',
    bulk: '1, 5, 10, 25, or 100',
    growth: '5,000 export credits',
    business: '25,000 export credits',
  },
  {
    feature: 'Enrichment credits',
    bulk: '1 per technology purchased',
    growth: '5,000 (prepaid)',
    business: '25,000 (prepaid)',
  },
  {
    feature: 'CSV Export',
    bulk: 'Yes',
    growth: 'Yes',
    business: 'Yes',
  },
  {
    feature: 'Dashboard tech filters',
    bulk: 'Yes',
    growth: 'Yes',
    business: 'Yes',
  },
  {
    feature: 'Best for',
    bulk: 'Single / few tech lists',
    growth: 'Agencies & sales teams',
    business: 'High-volume teams',
  },
]

export default function PricingPage() {
  const { data, user, updateUserCredits } = useSiteData()
  const content = data.content
  const plans = data.pricing_plans || []
  const faqs = data.faqs || []
  const [openFaq, setOpenFaq] = useState(0)
  const [buyingSlug, setBuyingSlug] = useState('')
  const [bulkQty, setBulkQty] = useState(1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const confirmingRef = useRef('')

  useEffect(() => {
    const status = searchParams.get('checkout')
    const sessionId =
      searchParams.get('session_id') || localStorage.getItem('tl_pending_checkout') || ''
    if (!status && !sessionId) return

    async function finishCheckout() {
      if (status === 'cancel') {
        localStorage.removeItem('tl_pending_checkout')
        setMessage('Checkout canceled. No credits were charged.')
        setSearchParams({})
        return
      }
      const shouldConfirm =
        (status === 'success' || (!status && sessionId)) && sessionId && user
      if (shouldConfirm) {
        if (confirmingRef.current === sessionId) return
        confirmingRef.current = sessionId
        try {
          const result = await confirmCheckoutSession(sessionId)
          updateUserCredits(result.user_credits)
          localStorage.removeItem('tl_pending_checkout')
          setMessage(
            result.credits_added > 0
              ? `Payment successful! Added ${result.credits_added.toLocaleString()} credits. Balance: ${result.user_credits.toLocaleString()}.`
              : `Payment already processed. Current balance: ${result.user_credits.toLocaleString()} credits.`,
          )
          setError('')
        } catch (err) {
          setError(err.message || 'Could not confirm payment')
          confirmingRef.current = ''
        }
        setSearchParams({})
      } else if (status === 'success' && !user) {
        setMessage('Payment received. Please log in to see your updated credits.')
        setSearchParams({})
      }
    }

    finishCheckout()
  }, [searchParams, setSearchParams, user, updateUserCredits])

  if (!content) return null

  const bulk = plans.find((p) => p.slug === 'bulk')
  const growth = plans.find((p) => p.slug === 'growth')
  const business = plans.find((p) => p.slug === 'business')
  const ordered = [bulk, growth, business].filter(Boolean)
  const displayPlans = ordered.length ? ordered : plans.slice(0, 3)

  async function buyPlan(plan, quantity = 1) {
    setError('')
    setMessage('')
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
      if (session.checkout_url) {
        if (session.session_id) {
          localStorage.setItem('tl_pending_checkout', session.session_id)
        }
        window.location.href = session.checkout_url
        return
      }
      setError('Checkout URL missing from Stripe response')
    } catch (err) {
      setError(err.message || 'Unable to start Stripe checkout')
    } finally {
      setBuyingSlug('')
    }
  }

  return (
    <div className="bg-card">
      <section className="border-b border-border bg-gradient-to-b from-hero to-page py-14 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            {content.pricing_title || 'Simple, transparent pricing'}
          </h1>
          <p className="mt-4 text-muted">
            {content.pricing_subtitle ||
              'Choose the plan that fits your needs. Upgrade anytime—no hidden fees.'}
          </p>
          {user ? (
            <p className="mt-4 inline-flex rounded-full bg-brand/15 px-4 py-1.5 text-sm font-semibold text-ink">
              Your balance: {(user.credits || 0).toLocaleString()} credits
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
        {message ? (
          <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {displayPlans.map((plan) => {
            const isBulk = plan.slug === 'bulk'
            const buying = buyingSlug === plan.slug
            const qty = isBulk ? bulkQty : 1
            const total = plan.monthly_price * qty
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border p-6 md:p-8 ${
                  plan.is_popular
                    ? 'border-brand bg-card shadow-xl shadow-brand/20 ring-1 ring-brand/40'
                    : 'border-border bg-card'
                }`}
              >
                {plan.is_popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-brand">
                    Most popular
                  </span>
                ) : null}

                <h2 className="text-2xl font-extrabold text-ink">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted">{plan.description}</p>

                {isBulk ? (
                  <div className="mt-5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Select quantity
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <select
                        value={bulkQty}
                        onChange={(e) => setBulkQty(Number(e.target.value))}
                        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand"
                      >
                        {BULK_QTY_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n} Technolog{n === 1 ? 'y' : 'ies'}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-muted">${plan.monthly_price}/each</span>
                    </div>
                    <p className="mt-4 text-4xl font-extrabold text-ink">${total}</p>
                    <p className="mt-1 text-sm font-semibold text-brand">one-time</p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-4xl font-extrabold text-ink">
                      ${plan.monthly_price}
                      <span className="ml-1 text-base font-semibold text-muted">one-time</span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-brand">
                      {plan.credits.toLocaleString()} enrichment credits
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
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-60 ${
                    plan.is_popular
                      ? 'bg-brand text-on-brand hover:bg-brand-dark'
                      : 'border border-border text-ink hover:border-brand hover:bg-surface'
                  }`}
                >
                  {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {buying ? 'Redirecting…' : plan.cta_label}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                  <Shield className="h-3.5 w-3.5" />
                  Secure payment via Stripe
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <h2 className="text-center text-3xl font-extrabold text-ink">Plan Comparison</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted">
            See how Bulk datasets, Growth, and Business compare at a glance.
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface/70 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Feature</th>
                  <th className="px-4 py-3 font-semibold">Bulk Purchase</th>
                  <th className="px-4 py-3 font-semibold">Growth</th>
                  <th className="px-4 py-3 font-semibold">Business</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{row.feature}</td>
                    <td className="px-4 py-3 text-muted">{row.bulk}</td>
                    <td className="px-4 py-3 text-muted">{row.growth}</td>
                    <td className="px-4 py-3 text-muted">{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h2 className="text-center text-3xl font-extrabold text-ink">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx
              return (
                <div key={faq.id} className="rounded-xl border border-border bg-card">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    onClick={() => setOpenFaq(open ? -1 : idx)}
                  >
                    <span className="font-semibold text-ink">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open ? (
                    <p className="border-t border-border px-5 py-4 text-sm text-muted">{faq.answer}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-semibold text-muted">
            <span>Secure Payment</span>
            <span>Credits never expire</span>
            <span>$29 / technology bulk datasets</span>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-6">
          <div className="brand-panel rounded-3xl px-6 py-12 text-ink md:px-10">
            <h2 className="text-2xl font-extrabold md:text-3xl">Need a custom credit volume?</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/75">
              Talk to sales for invoicing, team seats, and larger prepaid credit packs.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="rounded-xl bg-inverse px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-inverse/90"
              >
                Contact Sales
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl border border-ink/25 bg-card/40 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-card/70"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
