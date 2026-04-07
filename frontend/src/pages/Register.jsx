import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { User, Mail, Lock, Hash, BookOpen, GraduationCap, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

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

            <form className="w-full space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input type="text" placeholder="John Doe" className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700" />
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input type="email" placeholder="john.doe@example.com" className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700" />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full pl-12 pr-12 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input type="text" placeholder="Roll No." className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700" />
              </div>

              <div className="flex gap-3">
                <div className="relative w-1/2 group">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-4 h-4 transition-colors" />
                  <select className="w-full pl-9 pr-2 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none appearance-none text-gray-600 text-sm">
                    <option>CSE</option>
                    <option>IT</option>
                  </select>
                </div>
                <div className="relative w-1/2 group">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-4 h-4 transition-colors" />
                  <select className="w-full pl-9 pr-2 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none appearance-none text-gray-600 text-sm">
                    <option>Semester 1</option>
                    <option>Semester 2</option>
                  </select>
                </div>
              </div>

              <button className="w-full bg-[#7C7CC9] hover:bg-[#6B6BB3] text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 mt-4 transition-all active:scale-[0.98]">
                Register
              </button>
            </form>

            <div className="mt-8 text-center w-full">
              <p className="text-gray-500 text-sm font-medium">Already have an account?</p>
              <a href="/login" className="text-[#7C7CC9] font-bold text-sm hover:underline">Login</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;