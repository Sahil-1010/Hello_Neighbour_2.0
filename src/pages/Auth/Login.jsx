import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Login() {
  const { login, verifyOtp, resendOtp, addToast } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Inline OTP step for unverified accounts
  const [needsOtp, setNeedsOtp] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) { setError("Username is required."); return; }
    if (!form.password)         { setError("Password is required."); return; }
    setError("");
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate("/");
    } catch (err) {
      if (err.data?.needsVerification) {
        setPendingUserId(err.data.userId);
        setNeedsOtp(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);
    try {
      await verifyOtp(pendingUserId, otp.trim());
      addToast({ type: "success", message: "Account verified! Welcome to HelloNeighbour." });
      navigate("/onboarding");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setResendCooldown(true);
    setTimeout(() => setResendCooldown(false), 30000);
    try {
      await resendOtp(pendingUserId);
      addToast({ type: "info", message: "OTP resent" });
    } catch (err) {
      addToast({ type: "error", message: err.message });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Left — Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🏘️</div>
            <span className="text-white font-bold text-xl">HelloNeighbour</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Connect with your<br /><span className="text-emerald-200">local community</span>
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Find neighbors, discover local services, post help requests, and build
            connections within a 5 km radius.
          </p>
        </div>
        <div className="relative z-10 space-y-3">
          {[
            { emoji: "🔧", text: "Hire trusted local workers" },
            { emoji: "🛡️", text: "Community safety alerts" },
            { emoji: "🏪", text: "Discover local businesses" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-emerald-100">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-base">{item.emoji}</div>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
          <p className="text-emerald-200 text-sm pt-2">
            Trusted by <span className="font-bold text-white">12,000+</span> neighbors
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">🏘️</div>
            <span className="font-bold text-gray-900 dark:text-white text-xl">
              Hello<span className="text-emerald-500">Neighbour</span>
            </span>
          </div>

          <div className="card p-8">
            {!needsOtp ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to your neighborhood</p>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                    <input
                      type="text" value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="your_username" required className="input"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"} value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••" required className="input pr-11"
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-70">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : "Sign in"}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                  New here?{" "}
                  <Link to="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                    Create an account
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">🔐</div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify your account</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your account isn't verified yet. Enter the 6-digit OTP sent to your contact.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="input text-center text-2xl tracking-[0.5em] font-bold"
                    autoFocus
                  />
                  {otpError && <p className="text-sm text-red-500 text-center">{otpError}</p>}
                  <button type="submit" disabled={otp.length < 6 || otpLoading}
                    className="btn-primary w-full py-3 disabled:opacity-50">
                    {otpLoading ? "Verifying..." : "Verify & Sign in"}
                  </button>
                </form>

                <button onClick={handleResend} disabled={resendCooldown}
                  className="mt-4 w-full text-sm text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed">
                  {resendCooldown ? "Resend available in 30s" : "Resend OTP"}
                </button>

                <button
                  onClick={() => { setNeedsOtp(false); setOtp(""); setOtpError(""); setError(""); }}
                  className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  ← Back to sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
