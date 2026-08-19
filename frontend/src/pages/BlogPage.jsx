import { Link } from 'react-router-dom'
import { useSiteData } from '../context/SiteDataContext'

export default function BlogPage() {
  const { data } = useSiteData()
  const posts = data.blog_posts || []

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-gradient-to-b from-[#fffbeb] to-white py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Blog</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            Guides & Comparisons
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Insights on website technology detection, lead generation, and tool comparisons.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-brand/40 hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand">
                {post.category}
              </span>
              <h2 className="mt-4 text-lg font-bold leading-snug text-ink">{post.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{post.summary}</p>
              <Link to="/blog" className="mt-5 text-sm font-semibold text-brand hover:underline">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
