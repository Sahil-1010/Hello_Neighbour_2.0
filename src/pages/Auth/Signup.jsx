import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";

const roles = [
  {
    value: "normal",
    label: "Community Member",
    emoji: "👋",
    description: "Browse, post, connect, and request services in your neighborhood",
    perks: ["Post updates & warnings", "Request jobs/services", "Chat with neighbors"],
  },
  {
    value: "worker",
    label: "Worker / Freelancer",
    emoji: "🔧",
    description: "Offer your skills and services to neighbors nearby",
    perks: ["Create a work profile", "Accept job requests", "Build your reputation"],
  },
  {
    value: "business",
    label: "Business Owner",
    emoji: "🏪",
    description: "Promote your local business and connect with customers",
    perks: ["Business profile & dashboard", "Post offers & ads", "Manage job requests"],
  },
];

export default function Signup() {
  const { signup } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.role) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    signup(form.name, form.email, form.role);
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-56 h-56 bg-teal-200 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🏘️</div>
            <span className="text-white font-bold text-xl">HelloNeighbour</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Join your<br />
            <span className="text-green-200">neighborhood</span>
          </h1>
          <p className="text-green-100 text-base leading-relaxed">
            Create your profile and start connecting with people, businesses, and workers within 5 km of you.
          </p>
        </div>
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-white font-semibold mb-3">Step {step} of 2</p>
            <div className="flex gap-2">
              <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? "bg-white" : "bg-white/30"}`} />
              <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
            </div>
            <p className="text-green-200 text-sm mt-2">
              {step === 1 ? "Basic information" : "Choose your role"}
            </p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">🏘️</div>
            <span className="font-bold text-gray-900 dark:text-white text-xl">
              Hello<span className="text-emerald-500">Neighbour</span>
            </span>
          </div>

          {step === 1 ? (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Join thousands of neighbors near you</p>

              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Sarah Johnson"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setAgree(!agree)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      agree ? "bg-emerald-500 border-emerald-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {agree && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Terms of Service</span> and{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Privacy Policy</span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!agree || !form.name || !form.email || !form.password}
                  className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">How will you use HelloNeighbour?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Choose the role that best describes you</p>
              </div>

              <div className="space-y-3 mb-6">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={`w-full text-left card p-5 transition-all duration-200 hover:shadow-card-hover border-2 ${
                      form.role === role.value
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl mt-0.5">{role.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{role.label}</p>
                          {form.role === role.value && (
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check size={12} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{role.description}</p>
                        <div className="space-y-1">
                          {role.perks.map((perk) => (
                            <div key={perk} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary px-6 py-3">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.role || loading}
                  className="btn-primary flex-1 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Join the neighborhood 🏘️"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
