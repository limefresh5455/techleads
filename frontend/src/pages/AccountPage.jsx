import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Coins,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Shield,
  UserRound,
} from 'lucide-react'
import { changePassword, fetchMe, updateProfile } from '../api'
import { useSiteData } from '../context/SiteDataContext'

const field =
  'mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand'

export default function AccountPage() {
  const { user, updateUser, logout } = useSiteData()
  const [name, setName] = useState(user?.name || '')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [loadingMe, setLoadingMe] = useState(true)

  useEffect(() => {
    let alive = true
    fetchMe()
      .then((me) => {
        if (!alive) return
        updateUser(me)
        setName(me.name || '')
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoadingMe(false)
      })
    return () => {
      alive = false
    }
  }, [updateUser])

  if (!user) return null

  const initial = user.name?.trim()?.[0]?.toUpperCase() || 'U'
  const isGoogle = user.auth_provider === 'google'
  const credits = user.credits?.toLocaleString?.() ?? user.credits ?? 0

  async function onSaveProfile(e) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg('')
    setProfileError('')
    try {
      const me = await updateProfile({ name: name.trim() })
      updateUser(me)
      setProfileMsg('Profile updated')
    } catch (err) {
      setProfileError(err.message || 'Could not update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  async function onChangePassword(e) {
    e.preventDefault()
    setPasswordMsg('')
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    setPasswordSaving(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMsg('Password updated')
    } catch (err) {
      setPasswordError(err.message || 'Could not update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(255,210,63,0.35),_transparent_55%),linear-gradient(180deg,#fffbeb_0%,#f8f9fb_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 top-24 h-56 w-56 animate-float rounded-full bg-brand/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-40 h-64 w-64 animate-float rounded-full bg-[#ffd9b8]/40 blur-3xl [animation-delay:1.2s]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 lg:px-6 lg:py-14">
        <div className="animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">Account</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            TechLeads<span className="text-brand-dark">.Ai</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Manage your profile, credits, and sign-in settings in one place.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="animate-fade-up rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-sm backdrop-blur md:p-8 [animation-delay:80ms]">
            <div className="flex flex-wrap items-center gap-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-2xl font-extrabold text-ink shadow-sm shadow-brand/30">
                  {initial}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-extrabold text-ink">
                  {loadingMe ? 'Loading…' : user.name}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user.email}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/70">
                  <Shield className="h-3 w-3 text-brand-dark" />
                  {isGoogle ? 'Google account' : 'Email account'}
                </p>
              </div>
            </div>

            <form onSubmit={onSaveProfile} className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <UserRound className="h-4 w-4 text-brand-dark" />
                Profile details
              </div>
              <label className="block text-sm font-medium text-ink">
                Full name
                <input
                  className={field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Email
                <input className={`${field} bg-surface text-muted`} value={user.email} disabled />
              </label>
              <button
                type="submit"
                disabled={profileSaving || name.trim() === user.name}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-50"
              >
                {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {profileSaving ? 'Saving…' : 'Save changes'}
              </button>
              {profileMsg ? <p className="text-sm text-emerald-700">{profileMsg}</p> : null}
              {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
            </form>
          </section>

          <div className="space-y-6">
            <section className="animate-fade-up brand-panel relative overflow-hidden rounded-[1.75rem] p-6 text-ink md:p-7 [animation-delay:140ms]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink/65">Credits</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight">{credits}</p>
                  <p className="mt-2 max-w-xs text-sm text-ink/75">
                    Use credits to export technology lead lists (1 credit per technology).
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink/10">
                  <Coins className="h-5 w-5" />
                </span>
              </div>
              <Link
                to="/pricing"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-brand hover:bg-ink/90"
              >
                Buy credits
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="animate-fade-up rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-sm backdrop-blur md:p-7 [animation-delay:200ms]">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <KeyRound className="h-4 w-4 text-brand-dark" />
                Security
              </div>

              {isGoogle ? (
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  You signed in with Google. Password changes are managed in your Google account.
                </p>
              ) : (
                <form onSubmit={onChangePassword} className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-ink">
                    Current password
                    <input
                      className={field}
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-ink">
                    New password
                    <input
                      className={field}
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-ink">
                    Confirm new password
                    <input
                      className={field}
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink hover:bg-white disabled:opacity-50"
                  >
                    {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {passwordSaving ? 'Updating…' : 'Update password'}
                  </button>
                  {passwordMsg ? <p className="text-sm text-emerald-700">{passwordMsg}</p> : null}
                  {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
                </form>
              )}
            </section>

            <section className="animate-fade-up flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-border bg-white/90 px-6 py-5 shadow-sm [animation-delay:260ms]">
              <div>
                <p className="text-sm font-semibold text-ink">Session</p>
                <p className="mt-1 text-sm text-muted">Sign out of TechLeads on this device.</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
