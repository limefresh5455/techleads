import { Link } from 'react-router-dom'
import { Coins, Zap } from 'lucide-react'

export default function CreditsPanel({
  results,
  onExport,
  exporting,
  selectedTechCount = 0,
}) {
  const credits = results?.user_credits ?? 0
  const freeLimit = results?.free_limit ?? 10
  const totalFiltered = results?.total_filtered ?? 0
  const accessible = results?.accessible_records ?? freeLimit
  const exportCost = Math.max(0, selectedTechCount)
  const previewOnly = selectedTechCount === 0
  const exportRecords = previewOnly
    ? Math.min(accessible, freeLimit, totalFiltered)
    : totalFiltered
  const canExport = previewOnly
    ? exportRecords > 0
    : exportRecords > 0 && credits >= exportCost

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
        {previewOnly ? (
          <>
            <p className="text-xs text-muted">
              No technology selected — first {freeLimit} records are free to view and export.
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">
              Showing {exportRecords.toLocaleString()} of {totalFiltered.toLocaleString()} matches
            </p>
            <p className="mt-1 text-xs text-muted">Export cost: free</p>
          </>
        ) : (
          <>
            <p className="text-xs text-muted">
              Technology filter active — browse all matches free. Export costs 1 credit per
              technology.
            </p>
            <p className="mt-3 text-sm font-semibold text-ink">
              Export cost:{' '}
              <span className="text-brand-dark">
                {exportCost} credit{exportCost === 1 ? '' : 's'}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {selectedTechCount} technolog{selectedTechCount === 1 ? 'y' : 'ies'} selected · 1
              credit each
            </p>
          </>
        )}
      </div>

      <ul className="mt-4 space-y-2 text-xs text-muted">
        <li className="flex items-start gap-2">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          No tech selected: first {freeLimit} records free
        </li>
        <li className="flex items-start gap-2">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          With tech selected: browse all matches free
        </li>
        <li className="flex items-start gap-2">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          Export with tech: 1 credit per technology
        </li>
      </ul>

      {previewOnly && totalFiltered > freeLimit && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Select a technology to view and export all {totalFiltered.toLocaleString()} matches (1
          credit per technology).
        </p>
      )}

      {selectedTechCount > 0 && credits < exportCost && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Need {exportCost} credit{exportCost === 1 ? '' : 's'} to export. Buy more on Pricing.
        </p>
      )}

      <Link
        to="/pricing"
        className="mt-4 flex w-full items-center justify-center rounded-xl border border-brand bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/10"
      >
        Buy credits with Stripe
      </Link>

      <button
        type="button"
        onClick={onExport}
        disabled={exporting || !canExport}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-50"
      >
        {exporting
          ? 'Exporting…'
          : exportRecords > 0
            ? `Export CSV (${exportRecords.toLocaleString()} records)`
            : 'Export CSV'}
      </button>
    </div>
  )
}
