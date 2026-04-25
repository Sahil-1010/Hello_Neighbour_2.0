import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Layout from "./components/common/Layout";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Onboarding from "./pages/Onboarding/Onboarding";
import Home from "./pages/Home/Home";
import Nearby from "./pages/Nearby/Nearby";
import Profile from "./pages/Profile/Profile";
import Chat from "./pages/Chat/Chat";
import Jobs from "./pages/Jobs/Jobs";
import BusinessDashboard from "./pages/Business/BusinessDashboard";
import Businesses from "./pages/Businesses/Businesses";
import Notifications from "./pages/Notifications/Notifications";
import Reports from "./pages/Reports/Reports";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl animate-pulse">
          🏘️
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, authLoading, onboardingComplete } = useApp();
  const location = useLocation();

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!onboardingComplete && location.pathname !== "/onboarding")
    return <Navigate to="/onboarding" replace />;
  if (requiredRole && user.role !== requiredRole)
    return <Navigate to="/" replace />;

  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user, authLoading, onboardingComplete } = useApp();

  if (authLoading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to={onboardingComplete ? "/" : "/onboarding"} replace /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            user ? <Navigate to={onboardingComplete ? "/" : "/onboarding"} replace /> : <Signup />
          }
        />
        <Route
          path="/onboarding"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : onboardingComplete ? (
              <Navigate to="/" replace />
            ) : (
              <Onboarding />
            )
          }
        />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/nearby" element={<ProtectedRoute><Nearby /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/businesses" element={<ProtectedRoute><Businesses /></ProtectedRoute>} />
        <Route path="/business" element={<ProtectedRoute requiredRole="business"><BusinessDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
