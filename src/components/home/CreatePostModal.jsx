import { useState } from "react";
import { Image, AlertTriangle, HelpCircle, Tag, X } from "lucide-react";
import Modal from "../common/Modal";
import { useApp } from "../../context/AppContext";

const postTypes = [
  { value: "general", label: "General", icon: "💬", color: "bg-gray-100 text-gray-700" },
  { value: "warning", label: "Warning", icon: "⚠️", color: "bg-red-100 text-red-700" },
  { value: "help", label: "Help Needed", icon: "🆘", color: "bg-blue-100 text-blue-700" },
  { value: "offer", label: "Offer / Ad", icon: "🎉", color: "bg-emerald-100 text-emerald-700" },
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
            <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.neighborhood}</p>
          </div>
        </div>

        {/* Post type */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Post Type</p>
          <div className="grid grid-cols-2 gap-2">
            {postTypes.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setType(pt.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  type === pt.value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
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
            <span className={`text-xs ${content.length > 450 ? "text-red-500" : "text-gray-400"}`}>
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
              className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                showImageInput ? "bg-emerald-50 text-emerald-600" : "text-gray-500 hover:bg-gray-100"
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
