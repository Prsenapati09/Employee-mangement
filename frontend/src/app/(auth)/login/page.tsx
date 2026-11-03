"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

const features = [
  "Employee management",
  "Attendance and leave tracking",
  "Team collaboration",
  "Reports and analytics",
];

function Logo() {
  return (
    <Link href="/" className="flex w-fit items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-[#2e8b2e] text-xs font-extrabold text-white">
        HR
      </span>
      <span className="text-lg font-extrabold tracking-tight text-[#143d1f]">
        HRMPro
      </span>
    </Link>
  );
}

function WorkspaceIllustration() {
  return (
    <div aria-hidden="true" className="relative mt-8 h-64">
      <div className="absolute bottom-0 left-0 h-48 w-full rounded-[45%] bg-[#d7f0c8]" />
      <div className="absolute bottom-0 left-16 grid h-56 w-48 place-items-end justify-items-center overflow-hidden rounded-t-full bg-gradient-to-b from-[#bfe8b0] to-[#2e8b2e] text-white/80">
        <svg viewBox="0 0 120 120" className="mb-1 h-32 w-32 fill-current">
          <circle cx="60" cy="35" r="23" />
          <path d="M17 120c3-29 17-45 43-45s40 16 43 45H17Z" />
        </svg>
      </div>
      <div className="absolute bottom-8 left-0 w-40 rounded-xl bg-white p-3 shadow-xl shadow-green-900/10">
        <p className="text-[9px] font-bold text-gray-900">Team overview</p>
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-[#dcf5cf]" />
              <span className="h-1.5 flex-1 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-5 w-40 rounded-xl bg-white p-3 shadow-xl shadow-green-900/10">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dcf5cf] text-sm font-bold text-[#2e8b2e]">
            ✓
          </span>
          <div>
            <p className="text-[9px] font-bold text-gray-900">Good to see you!</p>
            <p className="text-[8px] text-[#2e8b2e]">Workspace ready</p>
          </div>
        </div>
        <div className="mt-3 flex h-8 items-end justify-end gap-1">
          {[14, 22, 18, 30].map((height) => (
            <span
              key={height}
              className="w-2 rounded-sm bg-[#2e8b2e]"
              style={{ height }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [organizationSlug, setOrganizationSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn({
        organizationSlug: organizationSlug.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      router.replace("/dashboard");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-200 bg-white py-3 px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#2e8b2e] focus:ring-2 focus:ring-[#2e8b2e]/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4fbee] p-4 sm:p-6">
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#f1fae9] via-white to-[#e8f7dc] shadow-xl shadow-green-900/10 lg:grid-cols-2">
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
              Sign in to access your dashboard and keep your workplace moving.
            </p>
            <ul className="mt-5 space-y-2.5">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2.5 text-sm text-gray-700"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2e8b2e] text-xs font-bold text-white">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <WorkspaceIllustration />
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8 lg:p-10">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg shadow-green-900/5 sm:p-8">
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Sign In</h2>
            <p className="mt-1 text-xs text-gray-500">
              Welcome back! Please enter your details.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="organizationSlug"
                  className="text-xs font-semibold text-gray-800"
                >
                  Organization slug
                </label>
                <input
                  id="organizationSlug"
                  name="organizationSlug"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="organization"
                  maxLength={80}
                  pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"
                  title="Use letters and numbers separated by single hyphens."
                  placeholder="your-organization"
                  value={organizationSlug}
                  onChange={(event) => setOrganizationSlug(event.target.value)}
                  required
                  className={`${inputClass} mt-1.5`}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-gray-800"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className={`${inputClass} mt-1.5`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-gray-800"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#2e8b2e] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-[#2e8b2e]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2e8b2e] py-3 text-sm font-semibold text-white transition hover:bg-[#256f25] focus:outline-none focus:ring-4 focus:ring-green-600/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-600">
              Need an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#2e8b2e] hover:underline"
              >
                Request access
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
