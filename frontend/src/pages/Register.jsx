import React, { useState } from "react";
import { User, Mail, Lock, Hash, BookOpen, GraduationCap, Eye, EyeOff } from "lucide-react";
import register_img from "../assets/register_img.png"
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/authhook.js";

const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT"];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNo: "",
    branch: "CSE",
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
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F3F4F6] w-full min-h-screen flex items-center justify-center font-sans p-4">
      {/* Main Container Card */}
      <div className="flex w-full max-w-[950px] bg-white rounded-[32px] shadow-lg overflow-hidden min-h-[650px]">
        
        {/* LEFT SIDE: Form Panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 lg:px-12 py-10">
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Header Section (Matches Login Update) */}
            <div className="text-center mb-8 flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#1F2937] mb-2">Create Account</h2>
              <p className="text-gray-500 text-sm mb-6">Join your academic community</p>
              
              {/* Profile Avatar Placeholder */}
              <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center border border-[#F3EFE7] mb-4">
                <User size={32} className="text-[#A39E93]" />
              </div>
            </div>

            {error && (
              <div className="w-full mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center border border-red-100">
                {error}
              </div>
            )}

            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl outline-none text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#8B89E3] focus:ring-4 focus:ring-[#8B89E3]/10 transition-all"
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl outline-none text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#8B89E3] focus:ring-4 focus:ring-[#8B89E3]/10 transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <Lock className="text-gray-400 w-5 h-5" />
                   <div className="w-[1px] h-5 bg-gray-200 ml-1"></div>
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-16 pr-12 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl outline-none text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#8B89E3] focus:ring-4 focus:ring-[#8B89E3]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B89E3]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Roll No */}
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="rollNo"
                  type="text"
                  placeholder="Roll Number"
                  value={form.rollNo}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl outline-none text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#8B89E3] focus:ring-4 focus:ring-[#8B89E3]/10 transition-all"
                />
              </div>

              {/* Branch & Semester Row */}
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    className="w-full pl-11 pr-2 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl outline-none appearance-none text-sm text-gray-600 focus:border-[#8B89E3] focus:ring-4 focus:ring-[#8B89E3]/10 transition-all cursor-pointer"
                  >
                    {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="relative flex-1 group">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className="w-full pl-11 pr-2 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl outline-none appearance-none text-sm text-gray-600 focus:border-[#8B89E3] focus:ring-4 focus:ring-[#8B89E3]/10 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B89E3] hover:bg-[#7A78D1] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#8B89E3]/30 transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[14px] text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-[#8B89E3] font-bold hover:underline ml-1">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Illustration Panel */}
        <div className="hidden md:flex w-[48%] bg-[#E5E7EB] m-4 rounded-[24px] items-center justify-center p-8">
          <img 
            src={register_img}
            alt="Register illustration"
            className="w-full max-w-[320px] object-contain mix-blend-multiply opacity-90"
          />
        </div>

      </div>
    </div>
  );
};

export default Register;