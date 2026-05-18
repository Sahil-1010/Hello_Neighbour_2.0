import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../common/Modal";

export default function OrderModal({ isOpen, onClose, business, onSubmit }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [budget, setBudget] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, { name: trimmed }]);
    setNewItem("");
  };

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const reset = () => {
    setItems([]); setNewItem(""); setBudget(""); setComment("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        businessId: business?.id || business?._id,
        items,
        budget: budget.trim(),
        comment: comment.trim(),
      });
      reset();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={`Order from ${business?.name || ""}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Items (optional)
          </label>
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                {item.name}
              </span>
              <button type="button" onClick={() => removeItem(i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
              placeholder="Add item…"
              className="input flex-1 text-sm"
            />
            <button type="button" onClick={addItem} className="btn-secondary p-2.5 flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Budget (optional)
          </label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. $50 or under $100"
            className="input"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Note / Request *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your order or any special instructions…"
            rows={3}
            className="input resize-none"
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => { reset(); onClose(); }} className="btn-secondary flex-1 py-2.5">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !comment.trim()}
            className="btn-primary flex-1 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing…
              </span>
            ) : "Place Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
