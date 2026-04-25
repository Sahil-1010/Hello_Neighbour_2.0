import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

const AppContext = createContext();

const neighborhoods = [
  "Downtown Heights", "Riverside Park", "Maple Grove", "Sunset Hills", "Harbor View",
  "Oak Valley", "Northgate", "Westfield", "Eastside Commons", "Greenwood",
];

export function AppProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Validate stored token on mount
  useEffect(() => {
    const token = localStorage.getItem("hn_token");
    if (!token) { setAuthLoading(false); return; }
    api.get("/auth/me")
      .then((data) => setUser(data))
      .catch(() => localStorage.removeItem("hn_token"))
      .finally(() => setAuthLoading(false));
  }, []);

  // ── Content ───────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});

  // Derived auth state
  const isAuthenticated = !!user;
  const onboardingComplete = !!user?.neighborhood;
  const currentNeighborhood = user?.neighborhood || "";

  // Build query params for geospatial-aware requests.
  // When the user has valid coordinates from onboarding, pass them so the
  // backend can use $near for the nearby-users query. Content (posts/jobs/
  // businesses) continues to use neighborhood-string filtering for backward
  // compatibility with data created before geolocation was added.
  function buildGeoParam() {
    const coords = user?.geoLocation?.coordinates; // [lng, lat] — GeoJSON order
    if (coords?.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
      return `&lat=${coords[1]}&lng=${coords[0]}`;
    }
    return "";
  }

  // Fetch content whenever the user's neighborhood changes (after onboarding)
  useEffect(() => {
    if (!user?.neighborhood) return;
    const hood = encodeURIComponent(user.neighborhood);
    const geoParam = buildGeoParam();

    api.get(`/posts?neighborhood=${hood}`).then(setPosts).catch(() => {});
    api.get(`/jobs?neighborhood=${hood}`).then(setJobs).catch(() => {});
    // Businesses + nearby users both use geospatial radius when coordinates are available
    api.get(`/businesses?neighborhood=${hood}${geoParam}`).then(setBusinesses).catch(() => {});
    api.get(`/users?neighborhood=${hood}${geoParam}`).then(setNearbyUsers).catch(() => {});
    api.get("/notifications").then(setNotifications).catch(() => {});
    api.get("/messages/conversations").then(setConversations).catch(() => {});
  }, [user?.neighborhood, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const login = async (username, password) => {
    const data = await api.post("/auth/login", { username, password });
    localStorage.setItem("hn_token", data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (formData) => {
    return await api.post("/auth/signup", formData);
  };

  const verifyOtp = async (userId, otp) => {
    const data = await api.post("/auth/verify-otp", { userId, otp });
    localStorage.setItem("hn_token", data.token);
    setUser(data.user);
    return data;
  };

  const resendOtp = async (userId) => {
    return await api.post("/auth/resend-otp", { userId });
  };

  const logout = () => {
    localStorage.removeItem("hn_token");
    setUser(null);
    setPosts([]);
    setJobs([]);
    setBusinesses([]);
    setNearbyUsers([]);
    setNotifications([]);
    setConversations([]);
    setMessages({});
  };

  // coords: { lat, lng } — collected from browser GPS or mock during onboarding
  const completeOnboarding = async (neighborhood, location, coords) => {
    const body = { neighborhood, location };
    if (coords?.lat !== undefined && coords?.lng !== undefined) {
      body.lat = coords.lat;
      body.lng = coords.lng;
    }
    const data = await api.put("/users/me/neighborhood", body);
    setUser(data);
  };

  const switchRole = async (role) => {
    const data = await api.put(`/users/${user.id}`, { role });
    setUser((prev) => ({ ...prev, role: data.role }));
    const label = role === "normal" ? "Community Member" : role === "worker" ? "Worker" : "Business Owner";
    addToast({ type: "success", message: `Switched to ${label} role` });
  };

  const switchNeighborhood = (name) => {
    addToast({ type: "info", message: `Switched to ${name}` });
  };

  // ── Business actions ──────────────────────────────────────────────────────
  const addBusiness = (business) => {
    setBusinesses((prev) => [business, ...prev]);
  };

  const updateBusiness = (updated) => {
    setBusinesses((prev) => prev.map((b) => b.id === updated.id ? updated : b));
  };

  // ── Post actions ──────────────────────────────────────────────────────────
  const addPost = async (postData) => {
    const newPost = await api.post("/posts", postData);
    setPosts((prev) => [newPost, ...prev]);
    addToast({ type: "success", message: "Post shared with your neighborhood! 🎉" });
  };

  const toggleLike = async (postId) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
    try {
      await api.put(`/posts/${postId}/like`);
    } catch {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
        )
      );
    }
  };

  const addComment = async (postId, text) => {
    const comment = await api.post(`/posts/${postId}/comments`, { text });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments + 1, commentList: [...(p.commentList || []), comment] }
          : p
      )
    );
  };

  // ── Job actions ───────────────────────────────────────────────────────────
  const addJob = async (jobData) => {
    const newJob = await api.post("/jobs", jobData);
    setJobs((prev) => [newJob, ...prev]);
    addToast({ type: "success", message: "Job posted! Workers nearby will see it." });
  };

  const applyForJob = async (jobId) => {
    await api.put(`/jobs/${jobId}/apply`);
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, applicants: j.applicants + 1 } : j));
    addToast({ type: "info", message: "Application submitted successfully!" });
  };

  const updateJobStatus = async (jobId, status) => {
    await api.put(`/jobs/${jobId}/status`, { status });
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status } : j));
    const msg = { ongoing: "Job started! 🚀", completed: "Job marked as completed! ✅" };
    if (msg[status]) addToast({ type: "success", message: msg[status] });
  };

  // ── Notification actions ──────────────────────────────────────────────────
  const markNotificationRead = async (notifId) => {
    await api.put(`/notifications/${notifId}/read`);
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast({ type: "success", message: "All notifications marked as read" });
  };

  // ── Chat actions ──────────────────────────────────────────────────────────
  const loadMessages = async (conversationId) => {
    const msgs = await api.get(`/messages/conversations/${conversationId}`);
    setMessages((prev) => ({ ...prev, [conversationId]: msgs }));
    return msgs;
  };

  const sendMessage = async (conversationId, text) => {
    const newMsg = await api.post(`/messages/conversations/${conversationId}`, { text });
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: text, timestamp: "Just now", unread: 0 } : c
      )
    );
  };

  const startConversation = async (recipientId) => {
    const conv = await api.post("/messages/conversations", { recipientId });
    setConversations((prev) => {
      if (prev.find((c) => c.id === conv.id)) return prev;
      return [conv, ...prev];
    });
    return conv;
  };

  // ── Derived counts ────────────────────────────────────────────────────────
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const unreadMsgCount = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  // Aliases kept for backward compatibility (filtering is now server-side)
  const filteredPosts = posts;
  const filteredJobs = jobs;
  const filteredBusinesses = businesses;

  return (
    <AppContext.Provider
      value={{
        // auth
        user, isAuthenticated, onboardingComplete, authLoading,
        login, signup, verifyOtp, resendOtp, logout, completeOnboarding, switchRole,
        // theme
        isDarkMode, toggleDarkMode,
        // neighborhood
        currentNeighborhood, switchNeighborhood, neighborhoods,
        // data
        posts, jobs, businesses, nearbyUsers, notifications, conversations, messages,
        // aliases
        filteredPosts, filteredJobs, filteredBusinesses,
        // counts
        unreadNotifCount, unreadMsgCount,
        // business actions
        addBusiness, updateBusiness,
        // post actions
        addPost, toggleLike, addComment,
        // job actions
        addJob, applyForJob, updateJobStatus,
        // notification actions
        markNotificationRead, markAllRead,
        // chat
        loadMessages, sendMessage, startConversation,
        // toasts
        toasts, addToast, removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
