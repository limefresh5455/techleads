import { Link } from 'react-router-dom'
import { Coins, Zap } from 'lucide-react'

export default function CreditsPanel({ results, onExport, exporting }) {
  const credits = results?.user_credits ?? 0
  const freeLimit = results?.free_limit ?? 10
  const maxPage = results?.max_page ?? 1
  const accessible = results?.accessible_records ?? freeLimit
  const totalFiltered = results?.total_filtered ?? 0
  const creditsPerPage = results?.credits_per_page ?? 10

  const usedFree = Math.min(freeLimit, results?.items?.length ?? 0)
  const progress = Math.min(100, (usedFree / freeLimit) * 100)

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Coins className="h-4 w-4 text-brand" />
          Credits
        </h3>
        <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
          {credits.toLocaleString()} left
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-surface/80 p-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Free results</span>
          <span className="font-semibold text-ink">
            {usedFree} / {freeLimit}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Showing top {freeLimit} records free. View up to{' '}
          <span className="font-semibold text-ink">{accessible.toLocaleString()}</span> with credits.
        </p>
      </div>

      <ul className="mt-4 space-y-2 text-xs text-muted">
        <li className="flex items-start gap-2">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          Page 1: {freeLimit} results included free
        </li>
        <li className="flex items-start gap-2">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          Page 2+: costs {creditsPerPage} credits per page
        </li>
        <li className="flex items-start gap-2">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          Export beyond {freeLimit}: 1 credit per extra row
        </li>
      </ul>

      {totalFiltered > freeLimit && maxPage <= 1 && credits === 0 && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {totalFiltered.toLocaleString()} matches found. Add credits to view or export more than{' '}
          {freeLimit}.
        </p>
      )}

      <Link
        to="/pricing"
        className="mt-4 flex w-full items-center justify-center rounded-xl border border-brand bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/10"
      >
        Get more credits
      </Link>

      <button
        type="button"
        onClick={onExport}
        disabled={exporting || !results?.items?.length}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-50"
      >
        {exporting ? 'Exporting…' : `Export CSV (${Math.min(results?.items?.length ?? 0, freeLimit)} free)`}
      </button>
    </div>
  )
}
