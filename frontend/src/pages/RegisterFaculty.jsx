import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  Key,
  User,
  ChevronDown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import facultyService from "../services/facultyService";

const RegisterFaculty = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    facultyCode: "",
  });

  const departments = [
    "CS",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
    "Other",
  ];
  const designations = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
    "HOD",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (
        !form.name ||
        !form.email ||
        !form.password ||
        !form.department ||
        !form.designation ||
        !form.facultyCode
      ) {
        setError("Please fill all required fields");
        setLoading(false);
        return;
      }

      await facultyService.registerFaculty(form);
      await login(form.email, form.password);
      navigate("/faculty");
    } catch (err) {
      console.error("Registration error:", err);
      const message =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F3FF] w-full min-h-screen flex items-center justify-center font-sans p-4 sm:p-6 custom-scrollbar">
      {/* Main Container - Responsive Border Radius */}
      <div className="flex w-full max-w-[1000px] bg-white rounded-3xl sm:rounded-[40px] shadow-2xl overflow-hidden min-h-[700px]">
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
          <div className="w-full max-w-[380px] flex flex-col items-center">
            {/* Header */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#a78bfa] shadow-lg shadow-purple-200 flex items-center justify-center mb-4 transform -rotate-3">
              <Briefcase size={30} color="white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
              Faculty Portal
            </h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">
              Create your academic profile
            </p>

            {/* Error message */}
            {error && (
              <div className="w-full mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-5 h-5 transition-colors" />
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-600 transition-all text-gray-800 font-medium placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-5 h-5 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="faculty@college.edu"
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
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Department & Designation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-4 h-4 transition-colors pointer-events-none" />
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-8 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-600 transition-all text-gray-800 font-medium"
                  >
                    <option value="" disabled>
                      Dept...
                    </option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>

                {/* Designation */}
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-4 h-4 transition-colors pointer-events-none" />
                  <select
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-8 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-600 transition-all text-gray-800 font-medium"
                  >
                    <option value="" disabled>
                      Title...
                    </option>
                    {designations.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Faculty Code */}
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-5 h-5 transition-colors" />
                <input
                  name="facultyCode"
                  type="password"
                  value={form.facultyCode}
                  onChange={handleChange}
                  placeholder="Admin Invite Code"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-600 transition-all text-gray-800 font-medium placeholder-gray-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />{" "}
                    Registering...
                  </>
                ) : (
                  "Create Faculty Account"
                )}
              </button>
            </form>

            {/* Footer Navigation Grid */}
            <div className="mt-8 text-center w-full">
              <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
                <span className="h-px w-full bg-gray-200"></span>
                <span>or</span>
                <span className="h-px w-full bg-gray-200"></span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="py-2.5 px-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl font-bold text-xs sm:text-sm hover:bg-purple-100 transition-colors flex items-center justify-center text-center leading-tight"
                >
                  Existing User Login
                </Link>
                <Link
                  to="/register"
                  className="py-2.5 px-2 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50 hover:text-purple-600 transition-colors flex items-center justify-center text-center leading-tight"
                >
                  Student Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFaculty;
