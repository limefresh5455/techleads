import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { confirmCheckoutSession, createCheckoutSession } from '../api'
import { useSiteData } from '../context/SiteDataContext'

export default function PricingPage() {
  const { data, user, updateUserCredits } = useSiteData()
  const content = data.content
  const plans = data.pricing_plans || []
  const faqs = data.faqs || []
  const [openFaq, setOpenFaq] = useState(0)
  const [buyingSlug, setBuyingSlug] = useState('')
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

  async function buyPlan(plan) {
    setError('')
    setMessage('')
    if (plan.slug === 'enterprise' || plan.credits <= 0 || plan.monthly_price <= 0) {
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
    <div className="bg-white">
      <section className="border-b border-border bg-gradient-to-b from-[#fffbeb] to-white py-14 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            {content.pricing_title}
          </h1>
          <p className="mt-4 text-muted">{content.pricing_subtitle}</p>
          {user ? (
            <p className="mt-4 inline-flex rounded-full bg-brand/15 px-4 py-1.5 text-sm font-semibold text-ink">
              Your balance: {(user.credits || 0).toLocaleString()} credits
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const isCustom = plan.slug === 'enterprise' || plan.monthly_price <= 0
            const buying = buyingSlug === plan.slug
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-6 md:p-7 ${
                  plan.is_popular
                    ? 'border-brand bg-white shadow-xl shadow-brand/15 ring-1 ring-brand/30'
                    : 'border-border bg-white'
                }`}
              >
                {plan.is_popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
                    Most Popular
                  </span>
                )}
                <h2 className="text-2xl font-extrabold text-ink">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted">{plan.description}</p>
                <div className="mt-6">
                  {isCustom ? (
                    <p className="text-4xl font-extrabold text-ink">Custom</p>
                  ) : (
                    <>
                      <p className="text-4xl font-extrabold text-ink">${plan.monthly_price}</p>
                      <p className="mt-1 text-sm font-semibold text-brand">
                        {plan.credits.toLocaleString()} credits · one-time
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        ≈ ${(plan.monthly_price / plan.credits).toFixed(3)} per credit
                      </p>
                    </>
                  )}
                </div>
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
                  onClick={() => buyPlan(plan)}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-60 ${
                    plan.is_popular
                      ? 'bg-brand text-ink hover:bg-brand-dark'
                      : 'border border-border text-ink hover:border-brand'
                  }`}
                >
                  {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {buying ? 'Redirecting…' : plan.cta_label}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-muted">
          <p className="font-semibold text-ink">Credit usage</p>
          <p className="mt-1">
            Free browsing of all dashboard results. Export costs 1 credit per selected
            technology. Payments are processed securely by Stripe.
          </p>
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h2 className="text-center text-3xl font-extrabold text-ink">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx
              return (
                <div key={faq.id} className="rounded-xl border border-border bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    onClick={() => setOpenFaq(open ? -1 : idx)}
                  >
                    <span className="font-semibold text-ink">{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && <p className="border-t border-border px-5 py-4 text-sm text-muted">{faq.answer}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-6">
          <div className="brand-panel rounded-3xl px-6 py-12 text-ink md:px-10">
            <h2 className="text-2xl font-extrabold md:text-3xl">Need a custom credit volume?</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/75">
              Talk to sales for invoicing, team seats, and larger prepaid credit packs.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink/90"
              >
                Contact Sales
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl border border-ink/25 bg-white/40 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/70"
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
