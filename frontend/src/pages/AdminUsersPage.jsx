import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Save, Edit, X, Users, CreditCard, Upload, Loader2 } from "lucide-react";
import { adminUsers } from "../adminApi";
import { useSiteData } from "../context/SiteDataContext";

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function AdminUsersPage() {
  const { user: currentUser, updateUser } = useSiteData();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "customer",
    credits: 0,
    password: "",
    avatar_url: ""
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await adminUsers.getAll();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        name: item.name,
        email: item.email,
        role: item.role,
        credits: item.credits,
        password: "",
        avatar_url: item.avatar_url || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "customer",
        credits: 0,
        password: "",
        avatar_url: ""
      });
    }
    setPreviewAvatarUrl("");
    setSelectedAvatarFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setPreviewAvatarUrl("");
    setSelectedAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedAvatarFile(file);
    setPreviewAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setUploadingAvatar(true);
      let finalAvatarUrl = formData.avatar_url;

      if (selectedAvatarFile) {
        const data = await adminUsers.uploadAvatar(selectedAvatarFile);
        finalAvatarUrl = data.url;
      }

      if (editingItem) {
        const payload = { ...formData, avatar_url: finalAvatarUrl };
        delete payload.password;
        await adminUsers.update(editingItem.id, payload);
        if (currentUser && String(currentUser.id) === String(editingItem.id)) {
           updateUser({ ...currentUser, ...payload });
        }
      } else {
        if (!formData.password) {
          alert("Password is required for new users");
          setUploadingAvatar(false);
          return;
        }
        await adminUsers.create({ ...formData, avatar_url: finalAvatarUrl });
      }
      setUploadingAvatar(false);
      closeModal();
      fetchItems();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user. Check console for details.");
      setUploadingAvatar(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminUsers.delete(id);
      fetchItems();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Check console for details.");
    }
  };

  if (loading) return <div className="p-8 text-ink">Loading...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <Users className="text-brand-dark" />
            Users
          </h1>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-ink rounded-lg font-medium hover:bg-brand/90 transition-colors"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto"><table className="w-full text-left text-sm text-ink">
          <thead className="bg-canvas border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Credits</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-3">
                    {item.avatar_url ? (
                      <img src={item.avatar_url} alt={item.name} className="w-8 h-8 rounded-full object-cover bg-surface shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-xs shrink-0">
                        {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{item.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.role === 'admin' ? 'bg-brand/20 text-brand' : 'bg-canvas text-ink/70'}`}>
                    {item.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.role === 'admin' ? (
                    <span className="text-muted italic text-xs">N/A</span>
                  ) : (
                    <span className="font-medium text-brand">{item.credits}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-ink/60">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openModal(item)}
                       className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-ink/60">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <Users size={24} className="text-brand-dark" />
                {editingItem ? "Edit User" : "Add User"}
              </h2>
              <button
                onClick={closeModal}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-brand"
                    placeholder="User name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-brand"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-brand"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {formData.role !== 'admin' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-ink">Credits</label>
                    <input
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                )}
                
                <div className={`space-y-1.5 ${formData.role === 'admin' ? 'col-span-2' : ''}`}>
                  <label className="text-sm font-medium text-ink">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {(previewAvatarUrl || formData.avatar_url) ? (
                      <div className="relative group">
                        <img src={previewAvatarUrl || formData.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover bg-surface" />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, avatar_url: "" });
                            setPreviewAvatarUrl("");
                            setSelectedAvatarFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <Users size={20} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand bg-brand/10 rounded hover:bg-brand/20 transition-colors"
                      >
                        <Upload size={16} />
                        Choose Image
                      </button>
                    </div>
                  </div>
                </div>
                {!editingItem && (
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-sm font-medium text-ink">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-brand"
                      placeholder="password"
                    />
                  </div>
                )}
              </div>

              {editingItem && editingItem.credit_purchases && formData.role !== 'admin' && (
                <div>
                  <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-brand" />
                    Purchase History
                  </h3>
                  <div className="bg-canvas rounded-lg border border-border overflow-x-auto"><table className="w-full text-left text-sm text-ink">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-medium">Plan</th>
                          <th className="px-4 py-3 font-medium">Amount</th>
                          <th className="px-4 py-3 font-medium">Credits</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {editingItem.credit_purchases.map(cp => (
                          <tr key={cp.id}>
                            <td className="px-4 py-3 font-medium">{cp.plan_slug}</td>
                            <td className="px-4 py-3">${(cp.amount_cents / 100).toFixed(2)}</td>
                            <td className="px-4 py-3 text-brand font-medium">+{cp.credits}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${cp.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                {cp.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-ink/60">
                              {formatDate(cp.created_at)}
                            </td>
                          </tr>
                        ))}
                        {editingItem.credit_purchases.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-4 py-6 text-center text-ink/60">
                              No purchase history
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-canvas/50 mt-auto">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-ink/70 hover:text-ink font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploadingAvatar}
                className="flex items-center gap-2 px-6 py-2 bg-brand text-ink rounded-lg font-medium hover:bg-brand/90 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{uploadingAvatar ? "Saving..." : "Save User"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




