import { useState } from 'react'
import { submitContact } from '../api'

export default function Contact({ content, trustLogos = [], showHeader = true }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company_website: '',
    message: '',
  })
  const [status, setStatus] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  if (!content) return null

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: '', text: '' })
    try {
      await submitContact(form)
      setStatus({ type: 'ok', text: 'Message sent! We will get back to you soon.' })
      setForm({ name: '', email: '', company_website: '', message: '' })
    } catch {
      setStatus({ type: 'err', text: 'Could not send message. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand'

  return (
    <section id="contact" className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-8 opacity-70 grayscale">
          {trustLogos.map((logo) => (
            <div key={logo.id} className="text-sm font-bold tracking-wide text-ink/50">
              {logo.name}
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-xl">
          {showHeader && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-ink">
                {content.contact_title}
              </h2>
              <p className="mt-3 text-muted">{content.contact_subtitle}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className={`${showHeader ? 'mt-8' : ''} space-y-4`}>
            <input
              className={fieldClass}
              placeholder="Name"
              value={form.name}
              onChange={update('name')}
              required
            />
            <input
              className={fieldClass}
              type="email"
              placeholder="Business Email"
              value={form.email}
              onChange={update('email')}
              required
            />
            <input
              className={fieldClass}
              placeholder="Company Website"
              value={form.company_website}
              onChange={update('company_website')}
            />
            <textarea
              className={`${fieldClass} min-h-32 resize-y`}
              placeholder="Message"
              value={form.message}
              onChange={update('message')}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Sending…' : content.contact_button_label}
            </button>
            {status.text && (
              <p
                className={`text-center text-sm ${
                  status.type === 'ok' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {status.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
