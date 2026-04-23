import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  User,
  Mail,
  Lock,
  BookOpen,
  Briefcase,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/authhook.js";
import api from "../services/api";

const departments = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Other",
];
const designations = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "HOD",
];

const RegisterFaculty = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "Computer Science",
    designation: "Assistant Professor",
    // facultyCode: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register-faculty", form);
      // Auto-login after register
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#E9EEF9] w-full min-h-screen flex items-center justify-center font-sans p-4">
      <div className="flex w-full max-w-[950px] bg-white rounded-[45px] shadow-xl overflow-hidden min-h-[650px] flex-row-reverse">
        {/* Animation side */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#EFF6FF] to-[#E9EEF9] items-center justify-center p-12">
          <div className="w-full transform scale-125">
            <DotLottieReact
              src="https://lottie.host/90a9ed88-2b4c-4900-be55-385f0a8e823c/gM4E1jLbQt.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* Form side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-[340px] flex flex-col items-center">
            {/* Faculty badge */}
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
              <Briefcase size={28} color="white" />
            </div>

            <h2 className="text-3xl font-bold text-[#2D3748] mb-1">
              Faculty Register
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Create your faculty account
            </p>

            {error && (
              <div className="w-full mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <form className="w-full space-y-3" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-blue-400 transition-all text-gray-700"
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="College Email"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-blue-400 transition-all text-gray-700"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-blue-400 transition-all text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Department */}
              <div className="relative group">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none appearance-none text-gray-600 text-sm"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none appearance-none text-gray-600 text-sm"
                >
                  {designations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Faculty invite code */}
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                <input
                  name="facultyCode"
                  type="text"
                  value={form.facultyCode}
                  onChange={handleChange}
                  placeholder="Faculty Registration Code"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-blue-400 transition-all text-gray-700"
                />
              </div>

              <p className="text-[11px] text-gray-400 text-center px-2">
                Faculty code is provided by the college administrator.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 mt-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Register as Faculty"}
              </button>
            </form>

            <div className="mt-6 text-center w-full space-y-2">
              <p className="text-gray-500 text-sm font-medium">
                Are you a student?{" "}
                <Link
                  to="/register"
                  className="text-[#7C7CC9] font-bold hover:underline"
                >
                  Register here
                </Link>
              </p>
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-bold hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFaculty;
