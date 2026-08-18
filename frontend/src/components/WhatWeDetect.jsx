const THEME = {
  orange: 'bg-[#fff1ea] border-[#ffd5c2]',
  peach: 'bg-[#fff5f0] border-[#ffd8c8]',
  mint: 'bg-[#f3fbf7] border-[#cfeedd]',
}

export default function WhatWeDetect({ content, groups = [] }) {
  if (!content) return null

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{content.detect_eyebrow}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {content.detect_title}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`rounded-2xl border p-6 ${THEME[group.theme] || THEME.orange}`}
            >
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(group.tags || []).map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-medium text-ink"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
