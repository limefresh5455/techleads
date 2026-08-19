import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

const SOCIAL_PATHS = {
  facebook: 'M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z',
  linkedin:
    'M6.5 9.5H4V20h2.5V9.5zM5.25 4A1.75 1.75 0 1 0 5.26 7.5 1.75 1.75 0 0 0 5.25 4zM20 20h-2.5v-5.6c0-1.5-.5-2.5-1.8-2.5-1 0-1.5.7-1.8 1.3-.1.2-.1.6-.1.9V20H11V9.5h2.4v1.4c.4-.7 1.3-1.7 3.1-1.7 2.3 0 3.5 1.5 3.5 4.4V20z',
  x: 'M17.7 4h2.6l-5.7 6.5L22 20h-5.8l-4.5-5.9L6.7 20H4l6.1-7L2.3 4h6l4.1 5.4L17.7 4zm-.9 14.4h1.4L7.3 5.5H5.8l10.9 12.9z',
  instagram:
    'M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2zm5.1-8.2a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.5c-2.3 0-2.6 0-3.5.1-.9 0-1.5.2-2 .4a4 4 0 0 0-1.5 1 4 4 0 0 0-1 1.5c-.2.5-.3 1.1-.4 2-.1.9-.1 1.2-.1 3.5s0 2.6.1 3.5c0 .9.2 1.5.4 2a4 4 0 0 0 1 1.5 4 4 0 0 0 1.5 1c.5.2 1.1.3 2 .4.9.1 1.2.1 3.5.1s2.6 0 3.5-.1c.9 0 1.5-.2 2-.4a4 4 0 0 0 1.5-1 4 4 0 0 0 1-1.5c.2-.5.3-1.1.4-2 .1-.9.1-1.2.1-3.5s0-2.6-.1-3.5c0-.9-.2-1.5-.4-2a4 4 0 0 0-1-1.5 4 4 0 0 0-1.5-1c-.5-.2-1.1-.3-2-.4-.9-.1-1.2-.1-3.5-.1zm0 1.5c2.3 0 2.5 0 3.4.1.8 0 1.2.2 1.5.3.4.1.6.3.9.6.3.3.5.5.6.9.1.3.3.7.3 1.5.1.9.1 1.1.1 3.4s0 2.5-.1 3.4c0 .8-.2 1.2-.3 1.5-.1.4-.3.6-.6.9-.3.3-.5.5-.9.6-.3.1-.7.3-1.5.3-.9.1-1.1.1-3.4.1s-2.5 0-3.4-.1c-.8 0-1.2-.2-1.5-.3-.4-.1-.6-.3-.9-.6-.3-.3-.5-.5-.6-.9-.1-.3-.3-.7-.3-1.5-.1-.9-.1-1.1-.1-3.4s0-2.5.1-3.4c0-.8.2-1.2.3-1.5.1-.4.3-.6.6-.9.3-.3.5-.5.9-.6.3-.1.7-.3 1.5-.3.9-.1 1.1-.1 3.4-.1z',
}

export default function Footer({
  content,
  footerColumns = [],
  socialLinks = [],
  legalLinks = [],
}) {
  if (!content) return null

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-8 border-b border-border pb-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-sm shadow-brand/30">
                <svg viewBox="0 0 32 32" className="h-5 w-5 text-ink" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M16 4.5c-1.2 0-2.2.7-2.6 1.8L8.2 22.1c-.2.6.2 1.2.8 1.2h2.3c.4 0 .8-.3.9-.7l1.1-3.4h6.4l1.1 3.4c.1.4.5.7.9.7h2.3c.6 0 1-.6.8-1.2l-5.2-15.8c-.4-1.1-1.4-1.8-2.6-1.8zm0 5.2 2.4 7.2h-4.8L16 9.7z"
                  />
                  <circle cx="25.2" cy="8.2" r="2.2" fill="currentColor" opacity="0.9" />
                </svg>
              </span>
              <span className="text-lg font-extrabold text-ink">
                {content.brand_name}
                <span className="text-brand">{content.brand_suffix}</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{content.footer_about}</p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((icon) => (
                <a
                  key={icon.id}
                  href={icon.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={icon.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-ink/70 hover:text-brand"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d={SOCIAL_PATHS[icon.icon_key] || SOCIAL_PATHS.x} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.id}>
              <h4 className="text-sm font-bold text-ink">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.id}>
                    <Link to={link.href} className="text-sm text-muted hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 pt-6 text-sm text-muted md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {content.footer_copyright}
          </p>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link key={link.id} to={link.href} className="hover:text-brand">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Link
        to="/contact-us"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-ink shadow-lg shadow-brand/40 transition hover:-translate-y-1 hover:bg-brand-dark"
      >
        <MessageCircle className="h-4 w-4" />
        {content.chat_label}
      </Link>
    </footer>
  )
}
