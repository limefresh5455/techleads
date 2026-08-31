import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, Circle, X } from 'lucide-react'
import { adminPricingPlans } from '../adminApi'

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  
  const defaultForm = { 
    name: '', 
    slug: '', 
    description: '', 
    monthly_price: 0, 
    yearly_price: 0, 
    credits: 0, 
    is_popular: false, 
    cta_label: 'Get Started',
    features: []
  }
  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const data = await adminPricingPlans.getAll()
      setPlans(data)
    } catch (err) {
      console.error('Failed to load pricing plans:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (plan = null) => {
    setEditingPlan(plan)
    // Create a deep copy of features to avoid mutating state directly
    setFormData(plan ? { ...plan, features: plan.features ? JSON.parse(JSON.stringify(plan.features)) : [] } : defaultForm)
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingPlan) {
        await adminPricingPlans.update(editingPlan.id, formData)
      } else {
        await adminPricingPlans.create(formData)
      }
      setIsModalOpen(false)
      loadPlans()
    } catch (err) {
      console.error('Failed to save pricing plan:', err)
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return
    try {
      await adminPricingPlans.delete(id)
      loadPlans()
    } catch (err) {
      console.error('Failed to delete pricing plan:', err)
    }
  }

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { label: '', value_text: '', included: true }]
    })
  }

  const updateFeature = (index, field, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index][field] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">Pricing Plans</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-on-brand px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand/90"
        >
          <Plus size={16} /> Add Plan
        </button>
      </div>

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Plan Details</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Pricing</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Features</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-center">Popular</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-canvas/50">
                  <td className="p-4">
                    <div className="font-medium text-ink">{plan.name}</div>
                    <div className="text-sm text-brand">{plan.slug}</div>
                    <div className="text-xs text-muted mt-1">{plan.credits} credits</div>
                  </td>
                  <td className="p-4 text-sm text-ink">
                    <div>${plan.monthly_price}/mo</div>
                    <div className="text-muted">${plan.yearly_price}/yr</div>
                  </td>
                  <td className="p-4 text-sm text-ink">
                    <span className="bg-canvas border border-border px-2 py-1 rounded text-xs font-medium">
                      {plan.features?.length || 0} features
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {plan.is_popular ? (
                      <CheckCircle className="inline-block text-green-500" size={18} />
                    ) : (
                      <Circle className="inline-block text-muted/50" size={18} />
                    )}
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="p-1.5 text-muted hover:text-brand hover:bg-brand/10 rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-muted">No pricing plans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-ink">
                {editingPlan ? 'Edit Pricing Plan' : 'Add Pricing Plan'}
              </h2>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="planForm" onSubmit={handleSave} className="space-y-6">
                
                {/* Basic Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase text-muted tracking-wider">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                        placeholder="e.g. Pro"
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
                        placeholder="e.g. pro"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                      placeholder="Short description under the plan name"
                    />
                  </div>
                </div>

                <hr className="border-border" />

                {/* Pricing & Capabilities */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase text-muted tracking-wider">Pricing & Capabilities</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Monthly Price ($)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.monthly_price}
                        onChange={e => setFormData({ ...formData, monthly_price: parseInt(e.target.value) || 0 })}
                        className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Yearly Price ($)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.yearly_price}
                        onChange={e => setFormData({ ...formData, yearly_price: parseInt(e.target.value) || 0 })}
                        className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Credits Included</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.credits}
                        onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                        className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">CTA Label</label>
                      <input
                        type="text"
                        required
                        value={formData.cta_label}
                        onChange={e => setFormData({ ...formData, cta_label: e.target.value })}
                        className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                        placeholder="e.g. Get Started"
                      />
                    </div>
                    <div className="flex items-center mt-6">
                      <label className="flex items-center cursor-pointer gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_popular}
                          onChange={e => setFormData({ ...formData, is_popular: e.target.checked })}
                          className="w-4 h-4 text-brand bg-canvas border-border rounded focus:ring-brand focus:ring-2"
                        />
                        <span className="text-sm font-medium text-ink">Mark as Popular Plan</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <hr className="border-border" />

                {/* Plan Features */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold uppercase text-muted tracking-wider">Features</h3>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-xs bg-canvas border border-border px-3 py-1.5 rounded-lg text-ink font-medium hover:bg-brand hover:text-on-brand hover:border-brand transition-colors"
                    >
                      + Add Feature
                    </button>
                  </div>
                  
                  {formData.features.length === 0 ? (
                    <div className="text-sm text-muted text-center py-4 bg-canvas/50 rounded-lg border border-dashed border-border">
                      No features added yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-3 items-start bg-canvas p-3 rounded-lg border border-border">
                          <label className="flex items-center pt-2 cursor-pointer" title="Is this feature included?">
                            <input
                              type="checkbox"
                              checked={feature.included}
                              onChange={(e) => updateFeature(index, 'included', e.target.checked)}
                              className="w-4 h-4 text-brand bg-surface border-border rounded focus:ring-brand focus:ring-2"
                            />
                          </label>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={feature.label}
                              onChange={(e) => updateFeature(index, 'label', e.target.value)}
                              placeholder="Feature name..."
                              className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                            />
                            <input
                              type="text"
                              value={feature.value_text || ''}
                              onChange={(e) => updateFeature(index, 'value_text', e.target.value)}
                              placeholder="Custom text (optional)"
                              className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-1.5 text-muted hover:text-red-500 rounded pt-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-canvas shrink-0 flex justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="planForm"
                className="px-4 py-2 bg-brand text-on-brand rounded-lg text-sm font-semibold hover:bg-brand/90"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
