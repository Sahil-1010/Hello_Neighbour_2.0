import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login(form.email);
    navigate("/onboarding");
  };

  const handleDemo = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login("sarah@example.com");
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              🏘️
            </div>
            <span className="text-white font-bold text-xl">HelloNeighbour</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Connect with your<br />
            <span className="text-emerald-200">local community</span>
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Find neighbors, discover local services, post help requests, and build
            meaningful connections within a 5 km radius.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { emoji: "🔧", text: "Hire trusted local workers" },
            { emoji: "🛡️", text: "Community safety alerts" },
            { emoji: "🤝", text: "Help your neighbors" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-emerald-100">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                {item.emoji}
              </div>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
          <p className="text-emerald-200 text-sm pt-4">
            Trusted by <span className="font-bold text-white">12,000+</span> neighbors across 200+ communities
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">🏘️</div>
            <span className="font-bold text-gray-900 text-xl">
              Hello<span className="text-emerald-500">Neighbour</span>
            </span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-8">Sign in to your neighborhood</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
                or
              </div>
            </div>

            <button
              onClick={handleDemo}
              disabled={loading}
              className="btn-secondary w-full py-3 text-sm"
            >
              🚀 Try Demo Account
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to the neighborhood?{" "}
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
