"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

const features = ["Employee management", "Attendance & leave tracking", "Team collaboration", "Reports & analytics"];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-[#2e8b2e] text-[11px] font-extrabold text-white">
        HR
      </span>
      <span className="text-lg font-extrabold tracking-tight text-[#143d1f]">HRMPro</span>
    </Link>
  );
}

function SocialButtons() {
  const base =
    "flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50";
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" className={base}>
        <span className="text-lg font-extrabold leading-none text-[#4285F4]">G</span> Google
      </button>
      <button type="button" className={base}>
        <span className="grid h-4 w-4 grid-cols-2 gap-px">
          <i className="bg-[#f25022]" />
          <i className="bg-[#7fba00]" />
          <i className="bg-[#00a4ef]" />
          <i className="bg-[#ffb900]" />
        </span>
        Microsoft
      </button>
    </div>
  );
}

/* Left-side illustration. Replace the green avatar block with a next/image photo if you have one. */
function Illustration() {
  return (
    <div className="relative mt-8 h-64">
      <div className="absolute bottom-0 left-0 h-52 w-80 rounded-[45%] bg-[#d7f0c8]" />
      <div className="absolute bottom-0 left-6 grid h-56 w-44 place-items-end justify-items-center overflow-hidden rounded-t-full bg-gradient-to-b from-[#bfe8b0] to-[#2e8b2e] text-white/80">
        <User size={110} />
      </div>
      <div className="absolute bottom-10 right-0 w-44 rounded-xl bg-white p-3 shadow-xl shadow-green-900/10">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dcf5cf] text-[#2e8b2e]">
            <Check size={14} />
          </span>
          <div>
            <p className="text-[9px] font-bold text-gray-900">Good to see you!</p>
            <p className="text-[7px] text-[#2e8b2e]">92% Present</p>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div
            className="relative h-12 w-12 rounded-full"
            style={{ background: "conic-gradient(#2e8b2e 0 82%, #dcf5cf 82% 100%)" }}
          >
            <div className="absolute inset-[24%] rounded-full bg-white" />
          </div>
          <div className="flex items-end gap-1">
            {[14, 22, 32].map((h) => (
              <span key={h} className="w-2 rounded-sm bg-[#2e8b2e]" style={{ height: h }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: call your auth API / NextAuth here, e.g.
      // await signIn("credentials", { email, password, remember, callbackUrl: "/dashboard" });
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#2e8b2e] focus:ring-2 focus:ring-[#2e8b2e]/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4fbee] p-4 sm:p-6">
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#f1fae9] via-white to-[#e8f7dc] shadow-xl shadow-green-900/10 lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden flex-col p-10 lg:flex xl:p-12">
          <Logo />
          <div className="mt-14">
            <span className="inline-block rounded-full bg-[#dcf5cf] px-3 py-1 text-[11px] font-semibold text-[#2e8b2e]">
              Welcome Back
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 xl:text-5xl">
              Manage Your
              <br />
              Workforce <span className="text-[#2eae1e]">with Ease</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
              Sign in to access your dashboard and continue building a better workplace.
            </p>
            <ul className="mt-5 space-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2e8b2e] text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Illustration />
        </section>

        {/* Right panel: form */}
        <section className="flex items-center justify-center p-4 sm:p-8 lg:p-10">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg shadow-green-900/5 sm:p-8">
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Sign In</h2>
            <p className="mt-1 text-xs text-gray-500">Welcome back! Please enter your details.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="text-xs font-semibold text-gray-800">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-semibold text-gray-800">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#2e8b2e]"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-semibold text-[#2e8b2e] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2e8b2e] py-3 text-sm font-semibold text-white transition hover:bg-[#256f25] disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign In"} {!loading && <ArrowRight size={15} />}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[11px] text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              or continue with
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <SocialButtons />

            <p className="mt-6 text-center text-xs text-gray-600">
              Don’t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#2e8b2e] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}