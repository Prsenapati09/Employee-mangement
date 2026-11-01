"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Building2, Check, Eye, EyeOff, Lock, Mail, Plus, User } from "lucide-react";

const features = ["14-day free trial", "No credit card required", "Easy setup process", "Scales with your business"];

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
      <div className="absolute bottom-0 left-0 h-52 w-full max-w-sm rounded-[45%] bg-[#d7f0c8]" />
      {/* Employee list card */}
      <div className="absolute bottom-6 left-0 w-36 rounded-xl bg-white p-3 shadow-xl shadow-green-900/10">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dcf5cf] text-[#2e8b2e]">
          <User size={16} />
        </span>
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2e8b2e]" />
              <span className="h-1.5 flex-1 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      {/* Person */}
      <div className="absolute bottom-0 left-24 grid h-56 w-48 place-items-end justify-items-center overflow-hidden rounded-t-full bg-gradient-to-b from-[#bfe8b0] to-[#2e8b2e] text-white/80">
        <User size={120} />
      </div>
      {/* Add Employee card */}
      <div className="absolute right-0 top-4 w-36 rounded-xl bg-white p-3 shadow-xl shadow-green-900/10">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-900">
          <span className="grid h-4 w-4 place-items-center rounded bg-[#2e8b2e] text-white">
            <Plus size={10} />
          </span>
          Add Employee
        </div>
        <div className="mt-3 flex items-end gap-1">
          {[12, 20, 30].map((h) => (
            <span key={h} className="w-2 rounded-sm bg-[#2e8b2e]" style={{ height: h }} />
          ))}
        </div>
      </div>
    </div>
  );
}

type FormState = { name: string; company: string; email: string; password: string };

const inputClass =
  "w-full rounded-md border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#2e8b2e] focus:ring-2 focus:ring-[#2e8b2e]/20";

function Required() {
  return <span className="text-red-500"> *</span>;
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>({ name: "", company: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // At least 8 characters with letters, numbers and a symbol
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) {
      setError("Use at least 8 characters with letters, numbers and a symbol.");
      return;
    }

    setLoading(true);
    try {
      // TODO: call your register API here, e.g.
      // await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4fbee] p-4 sm:p-6">
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#f1fae9] via-white to-[#e8f7dc] shadow-xl shadow-green-900/10 lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden flex-col p-10 lg:flex xl:p-12">
          <Logo />
          <div className="mt-14">
            <span className="inline-block rounded-full bg-[#dcf5cf] px-3 py-1 text-[11px] font-semibold text-[#2e8b2e]">
              Get Started
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 xl:text-5xl">
              Create Your
              <br />
              <span className="text-[#2eae1e]">Organization</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
              Set up your company and start managing your employees in just a few minutes.
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
            <h2 className="text-2xl font-extrabold text-gray-900">Create an Account</h2>
            <p className="mt-1 text-xs text-gray-500">Start your free trial and set up your organization.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-xs font-semibold text-gray-800">
                    Full Name
                    <Required />
                  </label>
                  <div className="relative mt-1.5">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="text-xs font-semibold text-gray-800">
                    Company Name
                    <Required />
                  </label>
                  <div className="relative mt-1.5">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="company"
                      name="company"
                      required
                      autoComplete="organization"
                      value={form.company}
                      onChange={onChange}
                      placeholder="Your Company"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-xs font-semibold text-gray-800">
                  Work Email
                  <Required />
                </label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-semibold text-gray-800">
                  Password
                  <Required />
                </label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Create a password"
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
                <p className={`mt-1.5 text-[10px] ${error ? "text-red-500" : "text-gray-500"}`}>
                  {error || "Use at least 8 characters with letters, numbers and a symbol."}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2e8b2e] py-3 text-sm font-semibold text-white transition hover:bg-[#256f25] disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Create Account"} {!loading && <ArrowRight size={15} />}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[11px] text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              or sign up with
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <SocialButtons />

            <p className="mt-5 text-center text-[11px] leading-relaxed text-gray-600">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="font-semibold text-[#2e8b2e] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[#2e8b2e] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <p className="mt-3 text-center text-xs text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#2e8b2e] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}