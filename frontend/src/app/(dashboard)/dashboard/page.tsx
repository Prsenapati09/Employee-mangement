"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function DashboardPage() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [router, session]);

  async function handleSignOut() {
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } catch {
      setError("Unable to contact the server to log out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  if (!session) {
    return (
      <main
        aria-busy="true"
        className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16"
      >
        <p className="text-sm text-slate-600">Checking your session...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            HRMPro
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSigningOut}
          onClick={handleSignOut}
          type="button"
        >
          {isSigningOut ? "Signing out..." : "Log out"}
        </button>
      </div>

      <section
        aria-label="Signed-in profile"
        className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold">Signed in</h2>
        <p className="mt-3 text-sm text-slate-700">
          {session.profile.user.email}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {session.profile.organization.name} ({session.profile.organization.slug})
        </p>
      </section>

      {error && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
