import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { User, Mail, Lock, Hash, BookOpen, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/authhook.js";

const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT"];

const Register = () => {
  const { register }  = useAuth();
  const navigate      = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const [form, setForm] = useState({
    name:     "",
    email:    "",
    password: "",
    rollNo:   "",
    branch:   "CSE",
    semester: "1",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);   // calls AuthContext → authService → /api/auth/register
      navigate("/");          // redirect to dashboard on success
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-[#E9EEF9] w-full min-h-screen flex items-center justify-center font-sans p-4">
      <div className="flex w-full max-w-[950px] bg-white rounded-[45px] shadow-xl overflow-hidden min-h-[650px] flex-row-reverse">
        
        {/* RIGHT SIDE (Animation) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#F0F4FF] to-[#E9EEF9] items-center justify-center p-12">
          <div className="w-full transform scale-125">
            <DotLottieReact
              src="https://lottie.host/90a9ed88-2b4c-4900-be55-385f0a8e823c/gM4E1jLbQt.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* LEFT SIDE (Form) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-[340px] flex flex-col items-center">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-1">Register</h2>
            <p className="text-gray-400 text-sm mb-8">Create a new account</p>

            {/* ── Error message ── */}
            {error && (
              <div className="w-full mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <form className="w-full space-y-3" onSubmit={handleSubmit}>

              {/* Name */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700"
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input
                  name="rollNo"
                  type="text"
                  value={form.rollNo}
                  onChange={handleChange}
                  placeholder="Roll No."
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative w-1/2 group">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-4 h-4 transition-colors" />
                  <select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    className="w-full pl-9 pr-2 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none appearance-none text-gray-600 text-sm"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="relative w-1/2 group">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-4 h-4 transition-colors" />
                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className="w-full pl-9 pr-2 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none appearance-none text-gray-600 text-sm"
                  >
                    {[1,2,3,4,5,6,7,8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7C7CC9] hover:bg-[#6B6BB3] text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 mt-4 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Register"}
              </button>

            </form>

            <div className="mt-8 text-center w-full">
              <p className="text-gray-500 text-sm font-medium">Already have an account?</p>
              <Link to="/login" className="text-[#7C7CC9] font-bold text-sm hover:underline">
                Login
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;