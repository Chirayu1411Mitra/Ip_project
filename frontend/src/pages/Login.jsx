import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-[#E9EEF9] w-full min-h-screen flex items-center justify-center font-sans p-4">
      {/* Main Card Container */}
      <div className="flex w-full max-w-[950px] bg-white rounded-[45px] shadow-xl overflow-hidden min-h-[600px]">
        
        {/* LEFT SIDE (Animation) - Hidden on Mobile */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#F0F4FF] to-[#E9EEF9] items-center justify-center p-12">
          <div className="w-full transform scale-110">
            <DotLottieReact
              src="https://lottie.host/4e633599-8d65-4d10-8d06-589aae5ac2af/lqy3MPxIK0.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-16">
          <div className="w-full max-w-[340px] flex flex-col items-center">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-1">Login</h2>
            <p className="text-gray-400 text-sm mb-8">Login to your account</p>

            {/* Avatar Circle */}
            <div className="w-24 h-24 bg-[#E9EEF9] rounded-full flex items-center justify-center mb-8 overflow-hidden relative">
              <DotLottieReact
                src="https://lottie.host/34ee98c2-4884-440d-bea8-4aed3476f528/DpStFqLUVX.lottie"
                loop
                autoplay
              />
            </div>

            <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C7CC9] w-5 h-5 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl outline-none focus:border-[#7C7CC9] transition-all text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#7C7CC9]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="text-right">
                <button className="text-xs text-[#7C7CC9] font-bold hover:underline">Forgot password?</button>
              </div>

              <button className="w-full bg-[#7C7CC9] hover:bg-[#6B6BB3] text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-2">
                Login
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm font-medium">Don't have an account?</p>
              <div className="w-full flex items-center justify-center gap-2 mt-2">
                <div className="h-[1px] bg-gray-100 flex-grow"></div>
                <a href="/register" className="text-[#7C7CC9] font-bold text-sm hover:underline">Register</a>
                <div className="h-[1px] bg-gray-100 flex-grow"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;