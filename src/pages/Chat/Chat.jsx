import { useState, useRef, useEffect } from "react";
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, Image, Smile } from "lucide-react";
import { useApp } from "../../context/AppContext";

const roleColors = {
  normal: "bg-blue-100 text-blue-700",
  worker: "bg-amber-100 text-amber-700",
  business: "bg-purple-100 text-purple-700",
};

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-gray-50 ${
        isActive ? "bg-emerald-50 border-r-2 border-emerald-500" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <img src={conv.user.avatar} alt={conv.user.name} className="w-12 h-12 rounded-full object-cover" />
        {conv.user.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`font-semibold text-sm ${isActive ? "text-emerald-700" : "text-gray-900"}`}>
            {conv.user.name}
          </span>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{conv.timestamp}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500 truncate flex-1">{conv.lastMessage}</p>
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
      {!isOwn && !prevOwn && (
        <div className="w-8 flex-shrink-0" />
      )}
      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? "bg-emerald-500 text-white rounded-br-md"
            : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
        }`}
      >
        {message.text}
      </div>
      <span className={`text-[10px] text-gray-400 flex-shrink-0 ${isOwn ? "text-right" : ""}`}>
        {message.timestamp}
      </span>
    </div>
  );
}

export default function Chat() {
  const { user, conversations, messages, sendMessage } = useApp();
  const [activeConv, setActiveConv] = useState(null);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [showConvList, setShowConvList] = useState(true);
  const messagesEndRef = useRef(null);

  const filteredConversations = conversations.filter(
    (c) => !search || c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeMessages = activeConv ? (messages[activeConv.id] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputText.trim());
    setInputText("");
  };

  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    setShowConvList(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex">
      {/* Conversation List */}
      <div
        className={`${
          showConvList ? "flex" : "hidden"
        } lg:flex flex-col w-full lg:w-80 xl:w-96 border-r border-gray-200 bg-white flex-shrink-0`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="font-bold text-gray-900 text-lg mb-3">Messages</h1>
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

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={activeConv?.id === conv.id}
              onClick={() => handleSelectConv(conv)}
            />
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {activeConv ? (
        <div className={`${!showConvList ? "flex" : "hidden"} lg:flex flex-1 flex-col bg-gray-50 min-w-0`}>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
              onClick={() => setShowConvList(true)}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative">
              <img src={activeConv.user.avatar} alt={activeConv.user.name} className="w-10 h-10 rounded-full object-cover" />
              {activeConv.user.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{activeConv.user.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`badge ${roleColors[activeConv.user.role]} capitalize text-[10px]`}>
                  {activeConv.user.role}
                </span>
                <span className={`text-[10px] ${activeConv.user.isOnline ? "text-emerald-500" : "text-gray-400"}`}>
                  {activeConv.user.isOnline ? "● Online" : "● Offline"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                <Phone size={18} />
              </button>
              <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                <Video size={18} />
              </button>
              <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {activeMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                  💬
                </div>
                <p className="text-gray-500 text-sm">No messages yet. Say hi!</p>
              </div>
            ) : (
              <div>
                {activeMessages.map((msg, i) => {
                  const isOwn = msg.senderId === user?.id;
                  const prevMsg = activeMessages[i - 1];
                  const prevOwn = prevMsg ? prevMsg.senderId === user?.id : null;
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={isOwn}
                      prevOwn={prevOwn === isOwn}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button type="button" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0">
                <Image size={20} />
              </button>
              <div className="flex-1 relative">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="input pr-10 py-2.5"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  <Smile size={18} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:cursor-not-allowed active:scale-95"
              >
                <Send size={18} className={inputText.trim() ? "text-white" : "text-gray-400"} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-5xl">
              💬
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              Select a conversation from the left to start chatting with your neighbors.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
