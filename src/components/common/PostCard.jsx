import { useState } from "react";
import { Heart, MessageCircle, Share2, MapPin, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Link } from "react-router-dom";

const roleColors = {
  normal: "bg-blue-100 text-blue-700",
  worker: "bg-amber-100 text-amber-700",
  business: "bg-purple-100 text-purple-700",
};

const postTypeBadge = {
  warning: { label: "⚠️ Warning", className: "bg-red-100 text-red-700" },
  help: { label: "🆘 Help Needed", className: "bg-blue-100 text-blue-700" },
  offer: { label: "🎉 Offer", className: "bg-green-100 text-green-700" },
  general: null,
};

const reactionEmojis = ["❤️", "👍", "😍", "🙌", "😂", "😮"];

export default function PostCard({ post }) {
  const { toggleLike, addComment, user } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText("");
  };

  const typeBadge = postTypeBadge[post.type];
  const totalReactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);

  return (
    <article
      className={`card overflow-hidden transition-shadow hover:shadow-card-hover ${
        post.type === "warning" ? "border-red-200 bg-red-50/30" : ""
      }`}
    >
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <Link to={`/profile/${post.author.id}`} className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">
                  {post.author.businessName || post.author.name}
                </span>
                <span className={`badge ${roleColors[post.author.role]} capitalize text-[10px]`}>
                  {post.author.role}
                </span>
                {typeBadge && (
                  <span className={`badge ${typeBadge.className} text-[10px]`}>
                    {typeBadge.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {post.author.location && (
                  <>
                    <MapPin size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{post.author.location}</span>
                    <span className="text-gray-300">·</span>
                  </>
                )}
                <span className="text-xs text-gray-400">{post.timestamp}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Content */}
        <p className="mt-3 text-gray-700 text-sm leading-relaxed">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="mt-3 mx-4">
          <img
            src={post.image}
            alt="Post"
            className="w-full rounded-xl object-cover max-h-72"
          />
        </div>
      )}

      {/* Reaction summary */}
      {totalReactions > 0 && (
        <div className="px-4 pt-3 pb-0 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-0.5">
              {Object.keys(post.reactions)
                .slice(0, 3)
                .map((emoji) => (
                  <span key={emoji} className="text-sm">
                    {emoji}
                  </span>
                ))}
            </div>
            <span>{totalReactions} reactions</span>
          </div>
          <button
            className="hover:text-emerald-600 transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            {post.commentList?.length || post.comments} comments
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 my-2 border-t border-gray-100" />

      {/* Action buttons */}
      <div className="px-2 pb-2 flex items-center gap-1">
        {/* Like */}
        <button
          onClick={() => toggleLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            post.isLiked
              ? "text-red-500 bg-red-50 hover:bg-red-100"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
          <span>{post.likes}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <MessageCircle size={18} />
          <span>{post.commentList?.length || post.comments}</span>
        </button>

        {/* React */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
          >
            😊
            <span className="text-xs">React</span>
          </button>
          {showReactions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowReactions(false)} />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex gap-1 z-20">
                {reactionEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-xl p-1.5 rounded-xl hover:bg-gray-100 transition-all hover:scale-125"
                    onClick={() => setShowReactions(false)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Share */}
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
          <Share2 size={18} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {(post.commentList || []).map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5">
              <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-900">{comment.author}</span>
                  <span className="text-[10px] text-gray-400">{comment.time}</span>
                </div>
                <p className="text-xs text-gray-700">{comment.text}</p>
              </div>
            </div>
          ))}

          {/* Add comment */}
          <form onSubmit={handleComment} className="flex items-center gap-2.5 mt-2">
            <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 relative">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full pl-3 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 disabled:text-gray-300 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
