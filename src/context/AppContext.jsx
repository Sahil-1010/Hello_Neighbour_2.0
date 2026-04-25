import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  currentUser,
  posts as initialPosts,
  jobs as initialJobs,
  notifications as initialNotifications,
  conversations as initialConversations,
  messages as initialMessages,
  extendedBusinesses,
} from "../data/mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // ── Dark mode (persisted) ──────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hn-dark") || "false"); }
    catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("hn-dark", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((d) => !d);

  // ── Neighborhood ──────────────────────────────────────────────────────────
  const [currentNeighborhood, setCurrentNeighborhood] = useState("Downtown Heights");

  const switchNeighborhood = (name) => {
    setCurrentNeighborhood(name);
    addToast({ type: "info", message: `Switched to ${name}` });
  };

  // ── Content ───────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState(initialPosts);
  const [jobs, setJobs] = useState(initialJobs);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);

  // Neighborhood-filtered slices (no neighborhood field = show everywhere)
  const filteredPosts = posts.filter(
    (p) => !p.neighborhood || p.neighborhood === currentNeighborhood
  );
  const filteredJobs = jobs.filter(
    (j) => !j.neighborhood || j.neighborhood === currentNeighborhood
  );
  const filteredBusinesses = extendedBusinesses.filter(
    (b) => !b.neighborhood || b.neighborhood === currentNeighborhood
  );

  // ── Toast system ──────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "info", message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const login = (email, role = "normal") => {
    setUser({ ...currentUser, email, role });
    setIsAuthenticated(true);
  };

  const signup = (name, email, role) => {
    setUser({ ...currentUser, name, email, role });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setOnboardingComplete(false);
  };

  const completeOnboarding = (neighborhood, location) => {
    setUser((prev) => ({ ...prev, neighborhood, location }));
    setCurrentNeighborhood(neighborhood);
    setOnboardingComplete(true);
  };

  const switchRole = (role) => {
    setUser((prev) => ({ ...prev, role }));
    addToast({ type: "success", message: `Switched to ${role === "normal" ? "Community Member" : role === "worker" ? "Worker" : "Business Owner"} role` });
  };

  // ── Post actions ──────────────────────────────────────────────────────────
  const addPost = (postData) => {
    const newPost = {
      id: Date.now(),
      author: { id: user.id, name: user.name, avatar: user.avatar, role: user.role, location: user.location },
      timestamp: "Just now",
      likes: 0, comments: 0, reactions: {}, isLiked: false, commentList: [],
      neighborhood: currentNeighborhood,
      ...postData,
    };
    setPosts((prev) => [newPost, ...prev]);
    addToast({ type: "success", message: "Post shared with your neighborhood! 🎉" });
  };

  const toggleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const addComment = (postId, text) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments + 1,
              commentList: [
                ...p.commentList,
                { id: Date.now(), author: user.name, avatar: user.avatar, text, time: "Just now" },
              ],
            }
          : p
      )
    );
  };

  // ── Job actions ───────────────────────────────────────────────────────────
  const addJob = (jobData) => {
    const newJob = {
      id: Date.now(),
      postedBy: { id: user.id, name: user.name, avatar: user.avatar },
      status: "pending", postedAt: "Just now", applicants: 0, urgency: "normal",
      neighborhood: currentNeighborhood,
      ...jobData,
    };
    setJobs((prev) => [newJob, ...prev]);
    addToast({ type: "success", message: "Job posted! Workers nearby will see it." });
  };

  const applyForJob = (jobId) => {
    setJobs((prev) =>
      prev.map((j) => j.id === jobId ? { ...j, applicants: j.applicants + 1 } : j)
    );
    addToast({ type: "info", message: "Application submitted successfully!" });
  };

  const updateJobStatus = (jobId, status) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
    const msg = { ongoing: "Job started! 🚀", completed: "Job marked as completed! ✅" };
    if (msg[status]) addToast({ type: "success", message: msg[status] });
  };

  // ── Notification actions ──────────────────────────────────────────────────
  const markNotificationRead = (notifId) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast({ type: "success", message: "All notifications marked as read" });
  };

  // ── Chat actions ──────────────────────────────────────────────────────────
  const sendMessage = (conversationId, text) => {
    const newMsg = {
      id: Date.now(),
      senderId: user.id,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: text, timestamp: "Just now", unread: 0 } : c
      )
    );
    addToast({ type: "success", message: "Message sent ✓", duration: 2000 });
  };

  // ── Derived counts ────────────────────────────────────────────────────────
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const unreadMsgCount = conversations.reduce((acc, c) => acc + c.unread, 0);

  return (
    <AppContext.Provider
      value={{
        // auth
        user, isAuthenticated, onboardingComplete,
        login, signup, logout, completeOnboarding, switchRole,
        // theme
        isDarkMode, toggleDarkMode,
        // neighborhood
        currentNeighborhood, switchNeighborhood,
        // raw data
        posts, jobs, notifications, conversations, messages,
        // filtered data
        filteredPosts, filteredJobs, filteredBusinesses,
        // counts
        unreadNotifCount, unreadMsgCount,
        // post actions
        addPost, toggleLike, addComment,
        // job actions
        addJob, applyForJob, updateJobStatus,
        // notification actions
        markNotificationRead, markAllRead,
        // chat
        sendMessage,
        // toasts
        toasts, addToast, removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
