import React, { useState } from "react";
// Added 'User' to the imports
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import login_img from "../assets/login_img.png";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/authhook.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
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
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid email or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F3F4F6] w-full min-h-screen flex items-center justify-center font-sans p-6">
      <div className="flex w-full max-w-[900px] bg-white rounded-[32px] shadow-sm overflow-hidden p-4 min-h-[550px]">
        <div className="hidden md:flex w-[45%] bg-[#E5E7EB] rounded-[24px] items-center justify-center p-8">
          <img
            src={login_img}
            alt="Reading illustration"
            className="w-full max-w-[280px] object-contain mix-blend-multiply opacity-80"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='16'%3EBook Illustration%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* RIGHT SIDE: Form Panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-[320px] flex flex-col items-center">
            {/* Profile Avatar Section */}
            <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center border border-[#F3EFE7] mb-4">
              <User size={32} className="text-[#A39E93]" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1F2937] mb-1">Login</h2>
              <p className="text-gray-500 text-sm">
                Welcome back to your academic hub
              </p>
            </div>

            {error && (
              <div className="w-full mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center border border-red-100">
                {error}
              </div>
            )}

            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] border-none rounded-xl outline-none text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#8B89E3]/20 transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Lock className="text-gray-400 w-4 h-4" />
                  <div className="w-[1px] h-4 bg-gray-300 ml-1"></div>
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-14 pr-11 py-3 bg-[#F3F4F6] border-none rounded-xl outline-none text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#8B89E3]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B89E3]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-[11px] text-gray-400 hover:text-[#8B89E3] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B89E3] hover:bg-[#7A78D1] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#8B89E3]/20 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-8 text-center">
              <p className="text-[13px] text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#8B89E3] font-bold hover:underline ml-1"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
