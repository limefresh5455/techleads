import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown } from 'lucide-react'
import { useSiteData } from '../context/SiteDataContext'

export default function PricingPage() {
  const { data } = useSiteData()
  const content = data.content
  const plans = data.pricing_plans || []
  const faqs = data.faqs || []
  const [yearly, setYearly] = useState(true)
  const [openFaq, setOpenFaq] = useState(0)

  if (!content) return null

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-gradient-to-b from-[#fffbeb] to-white py-14 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            {content.pricing_title}
          </h1>
          <p className="mt-4 text-muted">{content.pricing_subtitle}</p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                !yearly ? 'bg-brand text-ink' : 'text-muted'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                yearly ? 'bg-brand text-ink' : 'text-muted'
              }`}
            >
              Yearly <span className="opacity-90">{content.pricing_yearly_badge}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCustom = plan.slug === 'enterprise'
            const price = yearly ? plan.yearly_price : plan.monthly_price
            const savings = yearly
              ? Math.max(0, plan.monthly_price * 12 - plan.yearly_price)
              : 0
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
                      <p className="text-4xl font-extrabold text-ink">
                        ${price}
                        <span className="text-base font-medium text-muted">
                          {yearly ? '/yr' : '/mo'}
                        </span>
                      </p>
                      {yearly && savings > 0 && (
                        <p className="mt-1 text-sm font-medium text-brand">
                          Save ${savings} annually (~17% off)
                        </p>
                      )}
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
                <Link
                  to={isCustom ? '/contact' : '/signup'}
                  className={`mt-8 block rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                    plan.is_popular
                      ? 'bg-brand text-ink hover:bg-brand-dark'
                      : 'border border-border text-ink hover:border-brand hover:text-brand'
                  }`}
                >
                  {plan.cta_label}
                </Link>
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          All plans include our core technology detection database with over 300+ technologies
        </p>
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
            <h2 className="text-2xl font-extrabold md:text-3xl">Ready to Get Started?</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/75">
              Contact us today to discuss your data needs or choose a plan
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink/90"
              >
                Contact Sales
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-ink/25 bg-white/40 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/70"
              >
                Choose subscription
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
