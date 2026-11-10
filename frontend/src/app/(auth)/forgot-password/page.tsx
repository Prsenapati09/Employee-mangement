"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { forgotPassword } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await forgotPassword({
        organizationSlug: organizationSlug.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
      });
      setMessage(
        "If an account matches those details, a password reset email will be sent. Please check your inbox."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800">
            <ArrowLeft aria-hidden="true" size={16} />Back to login
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter your organization and registered email address. If your account matches, we will send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="organizationSlug" className="mb-2 block text-sm font-medium text-slate-700">
              Organization slug
            </label>
            <input
              id="organizationSlug"
              name="organizationSlug"
              value={organizationSlug}
              onChange={(event) => setOrganizationSlug(event.target.value)}
              required
              minLength={1}
              maxLength={80}
              pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"
              autoComplete="organization"
              placeholder="your-organization"
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Registered email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {message && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm leading-5 text-green-800">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail aria-hidden="true" size={16} />
            {loading ? "Sending request..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-green-700 hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
