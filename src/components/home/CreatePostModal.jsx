import { useState } from "react";
import { Image, X, Plus, Trash2 } from "lucide-react";
import Modal from "../common/Modal";
import { useApp } from "../../context/AppContext";

const postTypes = [
  { value: "general", label: "General", icon: "💬" },
  { value: "warning", label: "Warning", icon: "⚠️" },
  { value: "help", label: "Help Needed", icon: "🆘" },
  { value: "offer", label: "Offer / Ad", icon: "🎉" },
  { value: "order", label: "Order / Request", icon: "🛒" },
];

const ORDER_CATEGORIES = [
  "Food & Groceries", "Electronics", "Clothing", "Furniture", "Hardware",
  "Medicine", "Books", "Cleaning", "Stationery", "Other",
];

export default function CreatePostModal({ isOpen, onClose }) {
  const { addPost, user } = useApp();
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [orderCategories, setOrderCategories] = useState([]);
  const [orderBudget, setOrderBudget] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  const reset = () => {
    setContent(""); setType("general"); setImageUrl(""); setShowImageInput(false);
    setOrderCategories([]); setOrderBudget(""); setOrderItems([]); setNewItem("");
  };

  const toggleCategory = (cat) => {
    setOrderCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setOrderItems((prev) => [...prev, newItem.trim()]);
    setNewItem("");
  };

  const removeItem = (i) => setOrderItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const postData = { type, content: content.trim(), image: imageUrl.trim() || null };
    if (type === "order") {
      postData.orderCategories = orderCategories;
      postData.orderBudget = orderBudget.trim();
      postData.orderItems = orderItems;
    }
    addPost(postData);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author */}
        <div className="flex items-center gap-3">
          <img src={user?.avatar} alt={user?.name} className="w-11 h-11 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.neighborhood}</p>
          </div>
        </div>

        {/* Post type */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Post Type</p>
          <div className="grid grid-cols-2 gap-2">
            {postTypes.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setType(pt.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  type === pt.value
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <span>{pt.icon}</span>
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === "warning"
                ? "Describe the warning or alert for your community..."
                : type === "help"
                ? "What kind of help do you need?"
                : type === "offer"
                ? "Describe your offer or advertisement..."
                : type === "order"
                ? "Describe what you're looking to order or buy..."
                : "What's happening in your neighborhood?"
            }
            rows={4}
            className="input resize-none"
            autoFocus
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${content.length > 450 ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>
              {content.length}/500
            </span>
          </div>
        </div>

        {/* Order-specific fields */}
        {type === "order" && (
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            {/* Categories */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Categories (select all that apply)</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      orderCategories.includes(cat)
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Budget (optional)</p>
              <input
                type="text"
                value={orderBudget}
                onChange={(e) => setOrderBudget(e.target.value)}
                placeholder="e.g. $50 or under $100"
                className="input"
              />
            </div>

            {/* Items list */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Items (optional)</p>
              {orderItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                    {item}
                  </span>
                  <button type="button" onClick={() => removeItem(i)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors">
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
                  placeholder="Add an item..."
                  className="input flex-1 text-sm"
                />
                <button type="button" onClick={addItem}
                  className="btn-secondary p-2.5 flex-shrink-0">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image input */}
        {showImageInput && (
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL..."
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => { setShowImageInput(false); setImageUrl(""); }}
              className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                showImageInput ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Image size={16} />
              <span className="hidden sm:inline">Photo</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { reset(); onClose(); }} className="btn-secondary py-2 px-4 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="btn-primary py-2 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
