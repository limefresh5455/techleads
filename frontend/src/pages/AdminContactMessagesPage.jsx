import { useState, useEffect } from "react";
import { Trash2, MessageSquare, ExternalLink, X, Eye } from "lucide-react";
import { adminContactMessages } from "../adminApi";

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function AdminContactMessagesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await adminContactMessages.getAll();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await adminContactMessages.delete(id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      fetchItems();
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message. Check console for details.");
    }
  };

  const truncateMessage = (text, maxLength = 80) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) return <div className="p-8 text-ink">Loading...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <MessageSquare className="text-brand-dark" />
            Contact Messages
          </h1>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto"><table className="w-full text-left text-sm text-ink">
          <thead className="bg-canvas border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Message</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-canvas/50 transition-colors group cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <td className="px-6 py-4 text-ink/60 whitespace-nowrap align-top">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-6 py-4 font-medium align-top whitespace-nowrap">{item.name}</td>
                <td className="px-6 py-4 align-top">
                  <span className="text-brand">{item.email}</span>
                </td>
                <td className="px-6 py-4 text-ink/80 align-top max-w-[250px]">
                  <p className="text-sm truncate">{truncateMessage(item.message)}</p>
                </td>
                <td className="px-6 py-4 text-right align-top">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                      title="View Full Message"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Message"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-ink/60">
                  No messages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <MessageSquare size={24} className="text-brand-dark" />
                Message Details
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-canvas/50 p-4 rounded-lg border border-border">
                <div>
                  <label className="text-xs font-semibold text-ink/60 uppercase tracking-wider block mb-1">Name</label>
                  <p className="font-medium text-ink">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/60 uppercase tracking-wider block mb-1">Date</label>
                  <p className="text-ink">{formatDate(selectedItem.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/60 uppercase tracking-wider block mb-1">Email</label>
                  <a href={`mailto:${selectedItem.email}`} className="text-brand hover:underline break-all">
                    {selectedItem.email}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/60 uppercase tracking-wider block mb-1">Website</label>
                  {selectedItem.company_website ? (
                    <a href={selectedItem.company_website.startsWith('http') ? selectedItem.company_website : `https://${selectedItem.company_website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand hover:underline break-all">
                      {selectedItem.company_website}
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  ) : (
                    <span className="text-ink/40">-</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/60 uppercase tracking-wider block mb-2">Message</label>
                <div className="bg-canvas border border-border p-4 rounded-lg text-ink/80 whitespace-pre-wrap leading-relaxed break-all">
                  {selectedItem.message}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-between items-center bg-canvas/50 mt-auto">
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete Message</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2 bg-brand text-ink rounded-lg font-medium hover:bg-brand/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



