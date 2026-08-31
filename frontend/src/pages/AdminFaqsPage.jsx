import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { adminFaqs } from '../adminApi'

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [formData, setFormData] = useState({ question: '', answer: '', sort_order: 0 })

  useEffect(() => {
    loadFaqs()
  }, [])

  const loadFaqs = async () => {
    try {
      const data = await adminFaqs.getAll()
      setFaqs(data)
    } catch (err) {
      console.error('Failed to load FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (faq = null) => {
    setEditingFaq(faq)
    setFormData(faq || { question: '', answer: '', sort_order: 0 })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingFaq) {
        await adminFaqs.update(editingFaq.id, formData)
      } else {
        await adminFaqs.create(formData)
      }
      setIsModalOpen(false)
      loadFaqs()
    } catch (err) {
      console.error('Failed to save FAQ:', err)
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return
    try {
      await adminFaqs.delete(id)
      loadFaqs()
    } catch (err) {
      console.error('Failed to delete FAQ:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">FAQs</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-on-brand px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand/90"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Question</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faqs.map(faq => (
                <tr key={faq.id} className="hover:bg-canvas/50">
                  <td className="p-4">
                    <div className="font-medium text-ink">{faq.question}</div>
                    <div className="text-sm text-muted mt-1 line-clamp-1">{faq.answer}</div>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(faq)}
                      className="p-1.5 text-muted hover:text-brand hover:bg-brand/10 rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan="2" className="p-8 text-center text-muted">No FAQs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">
                {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
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
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
