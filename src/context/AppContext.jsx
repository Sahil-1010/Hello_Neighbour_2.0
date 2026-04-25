import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

const AppContext = createContext();

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
  const [myJobs, setMyJobs] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [neighborhoodsList, setNeighborhoodsList] = useState([]);
  const [offers, setOffers] = useState([]);

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
    api.get(`/businesses?neighborhood=${hood}${geoParam}`).then(setBusinesses).catch(() => {});
    api.get(`/businesses/offers?neighborhood=${hood}`).then(setOffers).catch(() => {});
    // Nearby users: server now filters by neighborhoodId — no geo param needed
    api.get(`/users?neighborhood=${hood}`).then(setNearbyUsers).catch(() => {});
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
    setMyJobs([]);
    setBusinesses([]);
    setNearbyUsers([]);
    setNotifications([]);
    setConversations([]);
    setMessages({});
    setNeighborhoodsList([]);
    setOffers([]);
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
    // Backend returns a new JWT token when role changes so requireRole() guards stay consistent
    if (data.token) {
      localStorage.setItem("hn_token", data.token);
    }
    setUser((prev) => ({ ...prev, role: data.role }));
    const label = role === "normal" ? "Community Member" : role === "worker" ? "Worker" : "Business Owner";
    addToast({ type: "success", message: `Switched to ${label} role` });
  };

  // Switch to a different neighborhood: update API + refetch all content
  const switchNeighborhood = async (neighborhoodId, neighborhoodName) => {
    try {
      await api.post(`/neighborhoods/${neighborhoodId}/join`, {
        lat: user?.geoLocation?.coordinates?.[1],
        lng: user?.geoLocation?.coordinates?.[0],
      });
      const fresh = await api.get("/auth/me");
      setUser(fresh);
      addToast({ type: "success", message: `Switched to ${neighborhoodName}` });
    } catch (err) {
      addToast({ type: "error", message: err.message || "Failed to switch neighborhood" });
    }
  };

  // Fetch a single user by ID (for profile page)
  const fetchUserById = async (id) => {
    return await api.get(`/users/${id}`);
  };

  // Toggle connection with another user; updates local connectionList state
  const connectUser = async (targetId) => {
    const data = await api.post(`/users/${targetId}/connect`, {});
    setUser((prev) => {
      if (!prev) return prev;
      const list = prev.connectionList || [];
      if (data.connected) {
        return { ...prev, connectionList: [...list, targetId], connections: (prev.connections || 0) + 1 };
      }
      return {
        ...prev,
        connectionList: list.filter((c) => c.toString() !== targetId),
        connections: Math.max(0, (prev.connections || 0) - 1),
      };
    });
    return data;
  };

  // ── Neighborhood actions ──────────────────────────────────────────────────
  const fetchNeighborhoods = async ({ lat, lng, search } = {}) => {
    const params = new URLSearchParams();
    if (lat !== undefined && lng !== undefined) { params.set("lat", lat); params.set("lng", lng); }
    if (search) params.set("search", search);
    const data = await api.get(`/neighborhoods?${params.toString()}`);
    setNeighborhoodsList(data);
    return data;
  };

  const createNeighborhood = async (name, { lat, lng, location } = {}) => {
    const data = await api.post("/neighborhoods", { name, lat, lng, location });
    setNeighborhoodsList((prev) => [data, ...prev]);
    const fresh = await api.get("/auth/me");
    setUser(fresh);
    return data;
  };

  const joinNeighborhood = async (id, { lat, lng, location } = {}) => {
    const data = await api.post(`/neighborhoods/${id}/join`, { lat, lng, location });
    const fresh = await api.get("/auth/me");
    setUser(fresh);
    return data;
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
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isDisliked: false }
          : p
      )
    );
    try {
      await api.put(`/posts/${postId}/like`);
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
    }
  };

  const toggleDislike = async (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isDisliked: !p.isDisliked, dislikes: (p.isDisliked ? (p.dislikes || 1) - 1 : (p.dislikes || 0) + 1), isLiked: false, likes: p.isLiked ? p.likes - 1 : p.likes }
          : p
      )
    );
    try {
      await api.put(`/posts/${postId}/dislike`);
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isDisliked: !p.isDisliked, dislikes: (p.isDisliked ? (p.dislikes || 1) - 1 : (p.dislikes || 0) + 1) }
            : p
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
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, applicants: (j.applicants || 0) + 1, hasApplied: true } : j));
    addToast({ type: "info", message: "Application submitted successfully!" });
  };

  const updateJobStatus = async (jobId, status, assignedTo) => {
    const body = { status };
    if (assignedTo) body.assignedTo = assignedTo;
    const updated = await api.put(`/jobs/${jobId}/status`, body);
    setJobs((prev) => prev.map((j) => j.id === jobId ? updated : j));
    setMyJobs((prev) => prev.map((j) => j.id === jobId ? updated : j));
    const msg = { ongoing: "Job started! 🚀", completed: "Job marked as completed! ✅" };
    if (msg[status]) addToast({ type: "success", message: msg[status] });
  };

  const loadMyJobs = async () => {
    const data = await api.get("/jobs/my");
    setMyJobs(data);
    return data;
  };

  const addJobComment = async (jobId, text) => {
    const updated = await api.post(`/jobs/${jobId}/comment`, { text });
    setJobs((prev) => prev.map((j) => j.id === jobId ? updated : j));
    setMyJobs((prev) => prev.map((j) => j.id === jobId ? updated : j));
    return updated;
  };

  const closeJob = async (jobId) => {
    const updated = await api.put(`/jobs/${jobId}/close`);
    setJobs((prev) => prev.map((j) => j.id === jobId ? updated : j));
    setMyJobs((prev) => prev.map((j) => j.id === jobId ? updated : j));
    addToast({ type: "info", message: "Job closed" });
  };

  const leaveNeighborhood = async (neighborhoodId) => {
    await api.post(`/neighborhoods/${neighborhoodId}/leave`);
    const fresh = await api.get("/auth/me");
    setUser(fresh);
    setPosts([]);
    setJobs([]);
    setBusinesses([]);
    setNearbyUsers([]);
  };

  // ── Moderation actions ────────────────────────────────────────────────────
  const reportContent = async ({ targetId, type, reason, description }) => {
    const data = await api.post("/reports", { targetId, type, reason, description });
    addToast({ type: "success", message: "Report submitted. Thank you for keeping the community safe." });
    return data;
  };

  const blockUser = async (targetId) => {
    const data = await api.post(`/users/${targetId}/block`, {});
    setUser((prev) => {
      if (!prev) return prev;
      const list = prev.blockedUsers || [];
      if (data.blocked) return { ...prev, blockedUsers: [...list, targetId] };
      return { ...prev, blockedUsers: list.filter((id) => id !== targetId) };
    });
    addToast({ type: "info", message: data.blocked ? "User blocked" : "User unblocked" });
    return data;
  };

  const muteUser = async (targetId) => {
    const data = await api.post(`/users/${targetId}/mute`, {});
    setUser((prev) => {
      if (!prev) return prev;
      const list = prev.mutedUsers || [];
      if (data.muted) return { ...prev, mutedUsers: [...list, targetId] };
      return { ...prev, mutedUsers: list.filter((id) => id !== targetId) };
    });
    addToast({ type: "info", message: data.muted ? "User muted" : "User unmuted" });
    return data;
  };

  const searchContent = async (q) => {
    if (!q || q.trim().length < 2) return { users: [], businesses: [], posts: [] };
    return await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
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
        user, setUser, isAuthenticated, onboardingComplete, authLoading,
        login, signup, verifyOtp, resendOtp, logout, completeOnboarding, switchRole,
        // theme
        isDarkMode, toggleDarkMode,
        // neighborhood
        currentNeighborhood, switchNeighborhood, leaveNeighborhood,
        neighborhoodsList, fetchNeighborhoods, createNeighborhood, joinNeighborhood,
        fetchUserById, connectUser,
        // data
        posts, jobs, myJobs, businesses, nearbyUsers, notifications, conversations, messages, offers,
        // aliases
        filteredPosts, filteredJobs, filteredBusinesses,
        // counts
        unreadNotifCount, unreadMsgCount,
        // business actions
        addBusiness, updateBusiness,
        // post actions
        addPost, toggleLike, toggleDislike, addComment,
        // moderation
        reportContent, blockUser, muteUser, searchContent,
        // job actions
        addJob, applyForJob, updateJobStatus, loadMyJobs, addJobComment, closeJob,
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
