import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Mail, Lock, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/authhook.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [banInfo, setBanInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBanInfo(null);
    setLoading(true);
    try {
      console.log("Login: Attempting to login with email:", form.email);
      await login(form.email, form.password);
      console.log("Login: Success, navigating to home");
      navigate("/");
    } catch (err) {
      console.error("Login: Caught error:", err);
      if (err?.response?.data?.banned === true) {
        setBanInfo(err.response.data);
      } else {
        const message =
          err?.response?.data?.message || "Invalid email or password";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 w-full min-h-screen flex items-center justify-center font-sans p-4 sm:p-6 custom-scrollbar">
      {/* Main Container - Responsive Border Radius */}
      <div className="flex w-full max-w-[1000px] bg-white rounded-3xl sm:rounded-[45px] shadow-2xl overflow-hidden min-h-[600px]">
        {/* LEFT SIDE (Animation - Hidden on Mobile) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-50 to-indigo-50 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
          <div className="w-full transform scale-110 z-10">
            <DotLottieReact
              src="https://lottie.host/4e633599-8d65-4d10-8d06-589aae5ac2af/lqy3MPxIK0.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-[360px] flex flex-col items-center">
            {/* Header */}
            <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mb-8 font-medium">
              Please enter your details to login
            </p>

            {/* Avatar Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-purple-50 rounded-full flex items-center justify-center mb-8 overflow-hidden relative shadow-inner">
              <DotLottieReact
                src="https://lottie.host/34ee98c2-4884-440d-bea8-4aed3476f528/DpStFqLUVX.lottie"
                loop
                autoplay
              />
            </div>

            {/* Ban Notice */}
            {banInfo && (
              <div className="w-full mb-6 p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-800 text-sm sm:text-base">
                      Account Suspended
                    </h3>
                    <p className="text-red-700 text-sm mt-1 leading-snug">
                      {banInfo.message}
                    </p>
                    {banInfo.banReason && (
                      <p className="text-red-600 text-xs italic mt-2 font-medium">
                        Reason: {banInfo.banReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Error Message */}
            {error && !banInfo && (
              <div className="w-full mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* Login Form */}
            {!banInfo && (
              <div className="w-full">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-5 h-5 transition-colors" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-600 transition-all text-gray-800 font-medium placeholder-gray-400"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-5 h-5 transition-colors" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-600 transition-all text-gray-800 font-medium placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="text-right pb-2">
                    <button
                      type="button"
                      className="text-xs text-purple-600 font-bold hover:text-purple-800 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />{" "}
                        Authenticating...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                {/* Footer Redirection - Updated to Mobile-Friendly Grid */}
                <div className="mt-8 text-center">
                  <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
                    <span className="h-px w-full bg-gray-200"></span>
                    <span>New Here?</span>
                    <span className="h-px w-full bg-gray-200"></span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/register"
                      className="py-2.5 px-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl font-bold text-xs sm:text-sm hover:bg-purple-100 transition-colors flex items-center justify-center text-center leading-tight"
                    >
                      Student Register
                    </Link>
                    <Link
                      to="/register-faculty"
                      className="py-2.5 px-2 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50 hover:text-purple-600 transition-colors flex items-center justify-center text-center leading-tight"
                    >
                      Faculty Register
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
