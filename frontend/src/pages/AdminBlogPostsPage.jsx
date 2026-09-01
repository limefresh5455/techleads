import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X , FileText } from 'lucide-react'
import { adminBlogPosts } from '../adminApi'

export default function AdminBlogPostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({ title: '', slug: '', summary: '', category: 'Guides' })

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const data = await adminBlogPosts.getAll()
      setPosts(data)
    } catch (err) {
      console.error('Failed to load blog posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (post = null) => {
    setEditingPost(post)
    setFormData(post || { title: '', slug: '', summary: '', category: 'Guides' })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingPost) {
        await adminBlogPosts.update(editingPost.id, formData)
      } else {
        await adminBlogPosts.create(formData)
      }
      setIsModalOpen(false)
      loadPosts()
    } catch (err) {
      console.error('Failed to save blog post:', err)
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    try {
      await adminBlogPosts.delete(id)
      loadPosts()
    } catch (err) {
      console.error('Failed to delete blog post:', err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <FileText className="text-brand" />
            Blog Posts
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-on-brand px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand/90"
        >
          <Plus size={16} /> Add Post
        </button>
      </div>

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Post details</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider w-32">Category</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-canvas/50">
                  <td className="p-4">
                    <div className="font-medium text-ink">{post.title}</div>
                    <div className="text-sm text-brand">{post.slug}</div>
                    <div className="text-sm text-muted mt-1 line-clamp-1">{post.summary}</div>
                  </td>
                  <td className="p-4 text-sm text-ink">{post.category}</td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(post)}
                      className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-muted">No blog posts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">
                {editingPost ? 'Edit Blog Post' : 'Add Blog Post'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Summary</label>
                <textarea
                  required
                  rows={4}
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-on-brand rounded-lg text-sm font-semibold hover:bg-brand/90"
                >
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
