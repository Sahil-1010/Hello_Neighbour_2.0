import { createContext, useContext, useState } from "react";
import {
  currentUser,
  posts as initialPosts,
  jobs as initialJobs,
  notifications as initialNotifications,
  conversations as initialConversations,
  messages as initialMessages,
} from "../data/mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [jobs, setJobs] = useState(initialJobs);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);

  const login = (email) => {
    setUser({ ...currentUser, email });
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
    setOnboardingComplete(true);
  };

  const addPost = (postData) => {
    const newPost = {
      id: Date.now(),
      author: { id: user.id, name: user.name, avatar: user.avatar, role: user.role, location: user.location },
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      reactions: {},
      isLiked: false,
      commentList: [],
      ...postData,
    };
    setPosts((prev) => [newPost, ...prev]);
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

  const addJob = (jobData) => {
    const newJob = {
      id: Date.now(),
      postedBy: { id: user.id, name: user.name, avatar: user.avatar },
      status: "pending",
      postedAt: "Just now",
      applicants: 0,
      urgency: "normal",
      ...jobData,
    };
    setJobs((prev) => [newJob, ...prev]);
  };

  const updateJobStatus = (jobId, status) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
  };

  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const sendMessage = (conversationId, text) => {
    const newMessage = {
      id: Date.now(),
      senderId: user.id,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: text, timestamp: "Just now", unread: 0 } : c
      )
    );
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const unreadMsgCount = conversations.reduce((acc, c) => acc + c.unread, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        onboardingComplete,
        posts,
        jobs,
        notifications,
        conversations,
        messages,
        unreadNotifCount,
        unreadMsgCount,
        login,
        signup,
        logout,
        completeOnboarding,
        addPost,
        toggleLike,
        addComment,
        addJob,
        updateJobStatus,
        markNotificationRead,
        markAllRead,
        sendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
