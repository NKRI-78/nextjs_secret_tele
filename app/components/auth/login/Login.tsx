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
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
      {/* --- CYBER BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0b1220] via-[#0a1c3a] to-[#06101d]" />
      {/* glow blobs */}
      <div className="pointer-events-none absolute -z-10 inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-40 bg-cyan-500" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl opacity-30 bg-blue-600" />
      </div>
      {/* grid */}
      <div
        className="absolute inset-0 -z-10 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* moving scan line */}
      <div className="scanline pointer-events-none absolute inset-0 -z-10 mix-blend-overlay" />

      {/* --- CONTENT --- */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        {/* glass card */}
        <div className="w-full max-w-md rounded-3xl border border-cyan-300/20 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(56,189,248,.15),0_0_40px_rgba(14,165,233,.12)_inset] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="value"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-cyan-200/80"
              >
                Username
              </label>
              <input
                type="text"
                id="value"
                value={val}
                onChange={(e) => dispatch(setVal(e.target.value))}
                placeholder="your.username"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 outline-none transition focus:border-cyan-300/60"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-cyan-200/80"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => dispatch(setPassword(e.target.value))}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 pr-12 text-white placeholder-white/50 outline-none transition focus:border-cyan-300/60"
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
            </div>

            {/* neon button */}
            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition active:scale-[0.99]"
            >
              <span className="relative z-10">
                {loading ? "Please wait..." : "START"}
              </span>
              {/* glow */}
              <span
                className="absolute inset-0 opacity-0 blur-xl transition group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(60% 100% at 50% 0%, rgba(255,255,255,.35), transparent 60%)",
                }}
              />
              {/* bottom flare */}
              <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </button>
          </form>

          {/* tiny footer accent */}
          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        </div>
      </div>

      {/* decorative “circuit” lines at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-[radial-gradient(80%_50%_at_50%_100%,rgba(56,189,248,.25),transparent)]" />

      {/* local CSS for scanline animation */}
      <style jsx>{`
        .scanline {
          background: repeating-linear-gradient(
            to bottom,
            rgba(56, 189, 248, 0.07) 0px,
            rgba(56, 189, 248, 0.07) 2px,
            transparent 2px,
            transparent 8px
          );
          animation: scanMove 7s linear infinite;
        }
        @keyframes scanMove {
          0% {
            background-position-y: 0%;
          }
          100% {
            background-position-y: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
