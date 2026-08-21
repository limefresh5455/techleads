import React from "react";

export default function Pagination({ currentPage, totalPages, next, prev }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border mt-8 pt-4">
      <button
        onClick={prev}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-ink bg-surface border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
      >
        Previous
      </button>
      <span className="text-sm text-muted">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={next}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-ink bg-surface border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
      >
        Next
      </button>
    </div>
  );
}
