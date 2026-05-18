import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e2e8f0'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%2394a3b8'/%3E%3Cellipse cx='20' cy='34' rx='12' ry='9' fill='%2394a3b8'/%3E%3C/svg%3E";
import { Send, Search, MoreVertical, ArrowLeft, Image, Smile, ShieldAlert, X, ShieldOff, BellOff, ShoppingBag } from "lucide-react";
import { useApp } from "../../context/AppContext";

const roleColors = {
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  worker: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  business: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

// ── Privacy Warning Modal ─────────────────────────────────────────────────────
// Shown once per browser session via sessionStorage. User must acknowledge.
function PrivacyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={24} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Privacy Notice</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Please read before chatting</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {[
            { icon: "🔒", text: "Messages are transmitted over TLS but are NOT end-to-end encrypted." },
            { icon: "🚫", text: "Do not share personal information — home address, financial details, or passwords." },
            { icon: "👤", text: "Only chat with neighbors you know or have verified through the platform." },
            { icon: "⚠️", text: "Report suspicious users via their profile. HelloNeighbour staff will never ask for your OTP or password." },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full py-3 text-base"
        >
          I Understand — Continue to Chat
        </button>
      </div>
    </div>
  );
}

// ── Persistent Warning Banner ────────────────────────────────────────────────
function PrivacyBanner({ onDismiss }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50">
      <ShieldAlert size={13} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
      <p className="flex-1 text-[11px] text-amber-700 dark:text-amber-400 leading-tight">
        <strong>Privacy notice:</strong> Messages are not end-to-end encrypted. Do not share sensitive personal information.
      </p>
      <button
        onClick={onDismiss}
        className="text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex-shrink-0 transition-colors"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
        isActive ? "bg-emerald-50 dark:bg-emerald-900/20 border-r-2 border-emerald-500" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <img src={conv.user.avatar || DEFAULT_AVATAR} alt={conv.user.name} onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} className="w-12 h-12 rounded-full object-cover" />
        {conv.user.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`font-semibold text-sm ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
            {conv.user.name}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">{conv.timestamp}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">{conv.lastMessage}</p>
          {conv.unread > 0 && (
            <span className="w-5 h-5 bg-emerald-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message, isOwn, prevOwn }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} ${prevOwn === isOwn ? "mt-1" : "mt-4"}`}>
      {!isOwn && !prevOwn && <div className="w-8 flex-shrink-0" />}
      <div className={`max-w-[70%] rounded-2xl text-sm leading-relaxed ${
        isOwn
          ? "bg-emerald-500 text-white rounded-br-md"
          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-600"
      }`}>
        {message.orderId && (
          <div className={`px-3 pt-2 pb-1 text-[10px] font-medium flex items-center gap-1 opacity-80 ${isOwn ? "text-emerald-100" : "text-emerald-600 dark:text-emerald-400"}`}>
            <ShoppingBag size={10} /> Regarding Order #{message.orderId.slice(-6).toUpperCase()}
          </div>
        )}
        <div className="px-4 py-2.5">{message.text}</div>
      </div>
      <span className={`text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ${isOwn ? "text-right" : ""}`}>
        {message.timestamp}
      </span>
    </div>
  );
}

export default function Chat() {
  const { user, conversations, messages, sendMessage, loadMessages, startConversation, blockUser, muteUser, addToast } = useApp();
  const [searchParams] = useSearchParams();
  const [activeConv, setActiveConv] = useState(null);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [showConvList, setShowConvList] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const messagesEndRef = useRef(null);

  // Show privacy modal once per browser session
  useEffect(() => {
    if (!sessionStorage.getItem("hn_chat_privacy_ack")) {
      setShowPrivacyModal(true);
    }
  }, []);

  // Auto-open conversation when arriving from a profile page (?userId=X)
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (!targetUserId || conversations.length === 0) return;

    const existing = conversations.find((c) => c.user?._id?.toString() === targetUserId || c.user?.id === targetUserId);
    if (existing) {
      handleSelectConv(existing);
      return;
    }
    // Create new conversation if none exists yet
    startConversation(targetUserId)
      .then((conv) => handleSelectConv(conv))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations]);

  const handleAcknowledgePrivacy = () => {
    sessionStorage.setItem("hn_chat_privacy_ack", "1");
    setShowPrivacyModal(false);
  };

  const filteredConversations = conversations.filter(
    (c) => !search || c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeMessages = activeConv ? (messages[activeConv.id] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const pendingOrderId = searchParams.get("orderId") || null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    const text = inputText.trim();
    setInputText("");
    await sendMessage(activeConv.id, text, pendingOrderId);
  };

  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    setShowConvList(false);
    if (!messages[conv.id]) loadMessages(conv.id).catch(() => {});
  };

  return (
    <>
      {showPrivacyModal && <PrivacyModal onClose={handleAcknowledgePrivacy} />}

      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex">
        {/* Conversation List */}
        <div className={`${showConvList ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 xl:w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0`}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h1 className="font-bold text-gray-900 dark:text-white text-lg mb-3">Messages</h1>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-3xl mb-3">💬</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet.</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Visit a neighbor's profile to start chatting.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConv?.id === conv.id}
                  onClick={() => handleSelectConv(conv)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        {activeConv ? (
          <div className={`${!showConvList ? "flex" : "hidden"} lg:flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 min-w-0`}>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <button
                className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowConvList(true)}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="relative">
                <img src={activeConv.user.avatar || DEFAULT_AVATAR} alt={activeConv.user.name} onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} className="w-10 h-10 rounded-full object-cover" />
                {activeConv.user.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{activeConv.user.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`badge ${roleColors[activeConv.user.role]} capitalize text-[10px]`}>{activeConv.user.role}</span>
                  <span className={`text-[10px] ${activeConv.user.isOnline ? "text-emerald-500" : "text-gray-400 dark:text-gray-500"}`}>
                    {activeConv.user.isOnline ? "● Online" : "● Offline"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 relative">
                <button
                  onClick={() => setShowChatMenu((v) => !v)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical size={18} />
                </button>
                {showChatMenu && (
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setShowChatMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-[9999]">
                      <button
                        onClick={async () => {
                          setShowChatMenu(false);
                          const otherId = activeConv?.user?._id || activeConv?.user?.id;
                          if (!otherId) return;
                          try { await blockUser(otherId); addToast({ type: "success", message: "User blocked." }); }
                          catch { addToast({ type: "error", message: "Could not block user" }); }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <ShieldOff size={14} /> Block user
                      </button>
                      <button
                        onClick={async () => {
                          setShowChatMenu(false);
                          const otherId = activeConv?.user?._id || activeConv?.user?.id;
                          if (!otherId) return;
                          try { await muteUser(otherId); addToast({ type: "success", message: "User muted." }); }
                          catch { addToast({ type: "error", message: "Could not mute user" }); }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <BellOff size={14} /> Mute user
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Persistent privacy banner */}
            {showBanner && <PrivacyBanner onDismiss={() => setShowBanner(false)} />}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {activeMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">💬</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet. Say hi!</p>
                </div>
              ) : (
                <div>
                  {activeMessages.map((msg, i) => {
                    const isOwn = msg.senderId === user?.id;
                    const prevMsg = activeMessages[i - 1];
                    const prevOwn = prevMsg ? prevMsg.senderId === user?.id : null;
                    return (
                      <MessageBubble key={msg.id} message={msg} isOwn={isOwn} prevOwn={prevOwn === isOwn} />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 flex-shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button type="button" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
                  <Image size={20} />
                </button>
                <div className="flex-1 relative">
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="input pr-10 py-2.5"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors">
                    <Smile size={18} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:cursor-not-allowed active:scale-95"
                >
                  <Send size={18} className={inputText.trim() ? "text-white" : "text-gray-400 dark:text-gray-500"} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-xs">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 text-5xl">💬</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Messages</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Select a conversation from the left to start chatting with your neighbors.
              </p>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
                <ShieldAlert size={14} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400 text-left">
                  Do not share sensitive personal information in chat.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
