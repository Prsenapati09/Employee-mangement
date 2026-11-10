"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { acceptInvitation } from "@/lib/auth-client";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Invitation link is missing or invalid.");
      return;
    }

    if (password.length < 12 || password.length > 128) {
      setError("Password must contain between 12 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvitation({ token, password });
      router.replace("/login?invitation=accepted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to accept invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <Link href="/" className="mb-8 flex w-fit items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-green-700 text-xs font-extrabold text-white">HR</span>
          <span className="text-xl font-extrabold tracking-tight text-green-950">HRMPro</span>
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">Accept your invitation</h1>
        <p className="mt-2 text-sm text-slate-600">
          Set a secure password to activate your employee account.
        </p>

        {!token ? (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Invitation token is missing. Please use the complete link from your invitation email.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              New password
              <input
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="At least 12 characters"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Confirm password
              <input
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="Enter your password again"
              />
            </label>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 aria-hidden="true" size={16} />
              {submitting ? "Activating account..." : "Activate account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
