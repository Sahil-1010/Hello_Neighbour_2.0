import { useState } from "react";
import { Image, X } from "lucide-react";
import Modal from "../common/Modal";
import { useApp } from "../../context/AppContext";

const postTypes = [
  { value: "general", label: "General", icon: "💬" },
  { value: "warning", label: "Warning", icon: "⚠️" },
  { value: "help", label: "Help Needed", icon: "🆘" },
  { value: "offer", label: "Offer / Ad", icon: "🎉" },
];

export default function CreatePostModal({ isOpen, onClose }) {
  const { addPost, user } = useApp();
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    addPost({
      type,
      content: content.trim(),
      image: imageUrl.trim() || null,
    });
    setContent("");
    setType("general");
    setImageUrl("");
    setShowImageInput(false);
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
                : "What's happening in your neighborhood?"
            }
            rows={5}
            className="input resize-none"
            autoFocus
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${content.length > 450 ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>
              {content.length}/500
            </span>
          </div>
        </div>

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
            <button type="button" onClick={onClose} className="btn-secondary py-2 px-4 text-sm">
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
