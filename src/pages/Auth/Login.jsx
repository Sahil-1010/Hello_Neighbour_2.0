import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";

const roles = [
  { value: "normal", emoji: "👋", label: "Community Member", desc: "Browse, post & connect" },
  { value: "worker", emoji: "🔧", label: "Worker", desc: "Find & accept jobs" },
  { value: "business", emoji: "🏪", label: "Business Owner", desc: "Manage your business" },
];

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("normal");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login(form.email, selectedRole);
    navigate("/onboarding");
  };

  const handleDemo = async (role = "normal") => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login("sarah@example.com", role);
    navigate("/onboarding");
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
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">🏘️</div>
            <span className="font-bold text-gray-900 dark:text-white text-xl">
              Hello<span className="text-emerald-500">Neighbour</span>
            </span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to your neighborhood</p>

            {/* ── Role Selection ──────────────────────────────────────────── */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Sign in as
              </p>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                      selectedRole === r.value
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <span className={`text-[10px] font-semibold leading-tight ${selectedRole === r.value ? "text-emerald-700 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"}`}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                {roles.find((r) => r.value === selectedRole)?.desc}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <input
                  type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com" className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••" className="input pr-11"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button type="button" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="text-xs text-gray-400 bg-white dark:bg-gray-800 px-3">or try a demo</span>
              </div>
            </div>

            {/* Quick demo buttons */}
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleDemo(r.value)}
                  disabled={loading}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-center transition-colors disabled:opacity-50"
                >
                  <span className="text-base">{r.emoji}</span>
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium leading-tight">{r.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">Demo accounts — no sign-up needed</p>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              New here?{" "}
              <Link to="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
