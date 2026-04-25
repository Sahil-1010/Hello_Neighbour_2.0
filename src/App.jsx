import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Notifications from "./pages/Notifications/Notifications";

function ProtectedRoute({ children }) {
  const { isAuthenticated, onboardingComplete } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { isAuthenticated, onboardingComplete } = useApp();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={onboardingComplete ? "/" : "/onboarding"} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to={onboardingComplete ? "/" : "/onboarding"} replace />
            ) : (
              <Signup />
            )
          }
        />
        <Route
          path="/onboarding"
          element={
            !isAuthenticated ? (
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
        <Route path="/business" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
