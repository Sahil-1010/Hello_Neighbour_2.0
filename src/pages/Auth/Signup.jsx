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
  const { signup, verifyOtp, resendOtp, addToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", username: "", contact: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP step
  const [pendingUserId, setPendingUserId] = useState(null);
  const [devOtp, setDevOtp] = useState(""); // OTP shown in dev mode
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  const handleStep1 = (e) => {
    e.preventDefault();
    setError("");
    if (form.username.length < 3) return setError("Username must be at least 3 characters");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.role) return;
    setLoading(true);
    setError("");
    try {
      const data = await signup({
        name: form.name.trim(),
        username: form.username.trim(),
        contact: form.contact.trim(),
        password: form.password,
        role: form.role,
      });
      setPendingUserId(data.userId);
      if (data.otp) setDevOtp(data.otp); // dev mode
      setStep(3);
    } catch (err) {
      setError(err.message);
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
      addToast({ type: "success", message: "Account verified! Let's set up your neighborhood." });
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
      const data = await resendOtp(pendingUserId);
      if (data.otp) setDevOtp(data.otp);
      addToast({ type: "info", message: "OTP resent" });
    } catch (err) {
      addToast({ type: "error", message: err.message });
    }
  };

  // ── Step 3: OTP ──────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-sm card p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">🔐</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify your account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter the 6-digit OTP sent to <span className="font-medium text-gray-700 dark:text-gray-300">{form.contact}</span>
            </p>
          </div>

          {devOtp && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Dev mode — your OTP:</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 tracking-widest mt-1">{devOtp}</p>
            </div>
          )}

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
            <button type="submit" disabled={otp.length < 6 || otpLoading} className="btn-primary w-full py-3 disabled:opacity-50">
              {otpLoading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>

          <button
            onClick={handleResend}
            disabled={resendCooldown}
            className="mt-4 w-full text-sm text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resendCooldown ? "Resend available in 30s" : "Resend OTP"}
          </button>
        </div>
      </div>
    );
  }

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
            Join your<br /><span className="text-green-200">neighborhood</span>
          </h1>
          <p className="text-green-100 text-base leading-relaxed">
            Create your profile and start connecting with people within 5 km.
          </p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <p className="text-white font-semibold mb-3">Step {step} of 3</p>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-all ${step >= s ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
          <p className="text-green-200 text-sm mt-2">
            {step === 1 ? "Basic information" : step === 2 ? "Choose your role" : "Verify account"}
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">🏘️</div>
            <span className="font-bold text-gray-900 dark:text-white text-xl">
              Hello<span className="text-emerald-500">Neighbour</span>
            </span>
          </div>

          {/* ── Step 1: Basic info ── */}
          {step === 1 && (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Join thousands of neighbors near you</p>

              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Sarah Johnson" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Username <span className="text-gray-400 text-xs">(must be unique)</span>
                  </label>
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                    placeholder="sarah_j" required minLength={3} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email or phone number</label>
                  <input type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    placeholder="you@example.com or +1234567890" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 6 characters" required minLength={6} className="input pr-11" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <div onClick={() => setAgree(!agree)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${agree ? "bg-emerald-500 border-emerald-500" : "border-gray-300 dark:border-gray-600"}`}>
                    {agree && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the <span className="text-emerald-600 dark:text-emerald-400 font-medium">Terms of Service</span> and{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Privacy Policy</span>
                  </span>
                </label>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button type="submit" disabled={!agree || !form.name || !form.username || !form.contact || !form.password}
                  className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
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
          )}

          {/* ── Step 2: Role selection ── */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">How will you use HelloNeighbour?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Choose the role that best describes you</p>
              </div>

              <div className="space-y-3 mb-6">
                {roles.map((role) => (
                  <button key={role.value} onClick={() => setForm({ ...form, role: role.value })}
                    className={`w-full text-left card p-5 transition-all duration-200 hover:shadow-card-hover border-2 ${
                      form.role === role.value
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    }`}>
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

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep(1); setError(""); }} className="btn-secondary px-6 py-3">← Back</button>
                <button onClick={handleSubmit} disabled={!form.role || loading}
                  className="btn-primary flex-1 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account →"
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
