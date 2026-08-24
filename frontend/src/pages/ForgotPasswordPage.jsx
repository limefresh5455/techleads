import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { sendOtp, verifyOtp, resetPassword } from '../api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const field = 'mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand'

  async function handleSendOtp(e) {
    e?.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const data = await sendOtp({ email })
      setStep(2)
      setSuccess(data?.message || 'OTP sent successfully.')
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await verifyOtp({ email, otp })
      setStep(3)
      setSuccess('OTP verified successfully.')
    } catch (err) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await resetPassword({ email, new_password: password })
      setSuccess('Password has been reset successfully. Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gradient-to-b from-hero to-page py-12 md:py-16 min-h-[80vh] flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-4">

        <Link to="/login" className="mb-6 inline-flex items-center text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter OTP'}
            {step === 3 && 'New Password'}
          </h1>
          <p className="mt-2 text-muted text-sm">
            {step === 1 && "Enter your email address and we'll send you an OTP."}
            {step === 2 && 'Please enter the OTP sent to your email.'}
            {step === 3 && 'Please enter your new password below.'}
          </p>

          <div className="mt-6">
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <label className="block text-sm font-medium text-ink">
                  Email
                  <input
                    className={field}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <label className="block text-sm font-medium text-ink">
                  OTP
                  <input
                    className={field}
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoFocus
                    placeholder="123456"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <p className="text-center text-xs text-muted">
                  Didn&apos;t receive it? <button type="button" onClick={handleSendOtp} className="text-brand hover:underline">Resend OTP</button>
                </p>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <label className="block text-sm font-medium text-ink">
                  New Password
                  <input
                    className={field}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    minLength={8}
                    placeholder="At least 8 characters"
                  />
                </label>
                <label className="block text-sm font-medium text-ink">
                  Confirm Password
                  <input
                    className={field}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Repeat your new password"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading || password.length < 8 || password !== confirmPassword}
                  className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {error && <p className="mt-4 text-center text-sm font-medium text-red-500">{error}</p>}
            {success && step !== 1 && <p className="mt-4 text-center text-sm font-medium text-emerald-500">{success}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
