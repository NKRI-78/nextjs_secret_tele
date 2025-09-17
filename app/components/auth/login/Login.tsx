"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@redux/store";
import {
  setVal,
  setPassword,
  setShowPassword,
  loginBotSecretAsync,
} from "@redux/slices/authSlice";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const val = useSelector((s: RootState) => s.auth.val);
  const password = useSelector((s: RootState) => s.auth.password);
  const loading = useSelector((s: RootState) => s.auth.loading);
  const showPassword = useSelector((s: RootState) => s.auth.showPassword);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(
      loginBotSecretAsync({ val, password })
    ).unwrap();

    Cookies.set("username", result.data.user.name, {
      expires: 365,
      secure: true,
      sameSite: "strict",
    });

    Cookies.set("token", result.data.token, {
      expires: 365,
      secure: true,
      sameSite: "strict",
    });

    router.push("/");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <img
        src="/images/bg.png"
        alt="Background"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/50 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white/10 border border-white/20 backdrop-blur p-8 shadow-xl">
          {/* Title & Subtitle */}
          <h1 className="text-3xl font-bold text-white text-center">
            Welcome Back!
          </h1>
          <p className="mt-1 mb-6 text-center text-white/70 text-sm">
            Please login before continuing
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
              <input
                type="text"
                id="value"
                value={val}
                onChange={(e) => dispatch(setVal(e.target.value))}
                placeholder="Username"
                className="w-full rounded-xl border border-white/30 bg-white/10 pl-10 pr-4 py-3 text-white placeholder-white/50 outline-none transition focus:border-blue-400"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                placeholder="Password"
                className="w-full rounded-xl border border-white/30 bg-white/10 pl-10 pr-12 py-3 text-white placeholder-white/50 outline-none transition focus:border-blue-400"
                required
              />
              <button
                type="button"
                onClick={() => dispatch(setShowPassword(!showPassword))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
