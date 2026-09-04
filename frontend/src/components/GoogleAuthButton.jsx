function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'techleads-1.onrender.com' || host.endsWith('.onrender.com')) {
      return 'https://techleads.onrender.com'
    }
  }
  return 'http://127.0.0.1:8000'
}

export function getGoogleAuthUrl(redirectPath = '/dashboard') {
  const params = new URLSearchParams({
    redirect: redirectPath.startsWith('/') ? redirectPath : '/dashboard',
  })
  return `${resolveApiBase()}/api/auth/google?${params.toString()}`
}

export default function GoogleAuthButton({
  label = 'Continue with Google',
  redirect = '/dashboard',
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = getGoogleAuthUrl(redirect)
      }}
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink transition hover:bg-surface"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 2.9.7 3.6 1.4l2.5-2.4C16.7 3.8 14.6 3 12 3 6.9 3 2.8 7.1 2.8 12.2S6.9 21.4 12 21.4c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.1-1.5H12z"
        />
        <path
          fill="#34A853"
          d="M6.5 14.3 5.4 17l-2.4.1C2.3 15.7 2 14 2 12.2c0-1.7.3-3.3.9-4.8l2.2.4 1.5 2.6c-.2.6-.3 1.2-.3 1.9 0 .7.1 1.3.2 2z"
        />
        <path
          fill="#4A90E2"
          d="M12 5.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17.2 2.1 14.8 1 12 1 8.1 1 4.7 3.1 3.1 6.4l2.9 2.2C6.8 6.6 9.2 5.1 12 5.1z"
        />
        <path
          fill="#FBBC05"
          d="M12 23c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 1-3.6 1-2.8 0-5.1-1.8-6-4.3l-2.9 2.2C4.7 20.9 8.1 23 12 23z"
        />
      </svg>
      {label}
    </button>
  )
}
