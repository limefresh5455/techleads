import { useEffect, useState, useRef } from 'react'
import { KeyRound, Loader2, Mail, Shield, UserRound, Camera, Settings } from 'lucide-react'
import { changePassword, fetchMe, updateProfile, uploadMyAvatar } from '../../services'
import { useSiteData } from '../../context/SiteDataContext'

const field =
  'mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-brand'

export default function AdminProfilePage() {
  const { user, updateUser } = useSiteData()
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

  const fileInputRef = useRef(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const me = await uploadMyAvatar(file)
      updateUser(me)
    } catch (err) {
      alert('Failed to upload image: ' + err.message)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <Settings className="text-brand-dark" />
            Admin Profile
          </h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr]">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="relative group cursor-pointer overflow-hidden rounded-2xl"
              onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className={`h-16 w-16 rounded-2xl object-cover ring-2 ring-brand/40 transition-opacity ${uploadingAvatar ? 'opacity-50' : ''}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  className={`grid h-16 w-16 place-items-center rounded-2xl bg-brand text-2xl font-extrabold text-on-brand shadow-sm shadow-brand/30 transition-opacity ${uploadingAvatar ? 'opacity-50' : ''}`}
                >
                  {initial}
                </span>
              )}
              <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-all bg-black/50 rounded-2xl backdrop-blur-[1px]">
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white/90 drop-shadow-md" />
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-extrabold text-ink">
                {loadingMe ? 'Loading...' : user.name}
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
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark disabled:opacity-50"
            >
              {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {profileSaving ? 'Saving...' : 'Save changes'}
            </button>
            {profileMsg ? <p className="text-sm text-emerald-700">{profileMsg}</p> : null}
            {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
          </form>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink hover:bg-card disabled:opacity-50"
              >
                {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {passwordSaving ? 'Updating...' : 'Update password'}
              </button>
              {passwordMsg ? <p className="text-sm text-emerald-700">{passwordMsg}</p> : null}
              {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
