"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = session?.profile.user.role;
  const canManageTeam = ["owner", "admin", "hr", "manager"].includes(role ?? "");
  const canManageEmployees = ["owner", "admin", "hr"].includes(role ?? "");
  const canManageOrganization = ["owner", "admin"].includes(role ?? "");
  const canViewReports = ["owner", "admin", "hr"].includes(role ?? "");

  useEffect(() => {
    if (!isLoading && !session) router.replace("/login");
  }, [isLoading, router, session]);

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

  if (isLoading || !session) {
    return (
      <main
        aria-busy="true"
        className="flex min-h-screen items-center justify-center bg-slate-50 px-6"
      >
        <p className="text-sm text-slate-600">Checking your session...</p>
      </main>
    );
  }

  const organizationName = session.profile.organization.name;
  const userEmail = session.profile.user.email;

  function navigate(path: string) {
    setMobileMenuOpen(false);
    router.push(path);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`${mobileMenuOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-40 h-screen w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white p-5 md:sticky md:top-0 md:flex md:shrink-0`}
        >
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white">
              H
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">HRMPro</p>
              <p className="text-xs text-slate-500">People management</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>
            <nav aria-label="Main navigation" className="mt-3 space-y-1">
              <button
                type="button"
                aria-current={pathname === "/dashboard" ? "page" : undefined}
                onClick={() => navigate("/dashboard")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard aria-hidden="true" size={18} />
                Dashboard
              </button>
              {canManageEmployees && (
                <button
                  type="button"
                  aria-current={pathname === "/employees" ? "page" : undefined}
                  onClick={() => navigate("/employees")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    pathname === "/employees"
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Users aria-hidden="true" size={18} />
                  Employees
                </button>
              )}
            </nav>
          </div>

          <div className="mt-8">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace tools
            </p>
            <nav aria-label="Workspace tools" className="mt-3 space-y-1">
              {canViewReports && (
                <button
                  type="button"
                  aria-current={pathname === "/reports" ? "page" : undefined}
                  onClick={() => navigate("/reports")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    pathname === "/reports"
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <BarChart3 aria-hidden="true" size={18} />
                  Reports
                </button>
              )}
              {canManageTeam && (
                <button
                  type="button"
                  aria-current={pathname === "/departments" ? "page" : undefined}
                  onClick={() => navigate("/departments")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    pathname === "/departments"
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Building2 aria-hidden="true" size={18} />
                  Departments
                </button>
              )}
              <button
                type="button"
                aria-current={pathname === "/attendance" ? "page" : undefined}
                onClick={() => navigate("/attendance")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname === "/attendance"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <CalendarDays aria-hidden="true" size={18} />
                Attendance
              </button>
              <button
                type="button"
                aria-current={pathname === "/leaves" ? "page" : undefined}
                onClick={() => navigate("/leaves")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname === "/leaves"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <CalendarDays aria-hidden="true" size={18} />
                Leave management
              </button>
            </nav>
          </div>

          <div className="mt-8">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Personal
            </p>
            <nav aria-label="Personal tools" className="mt-3 space-y-1">
              <button
                type="button"
                aria-current={pathname === "/documents" ? "page" : undefined}
                onClick={() => navigate("/documents")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname === "/documents"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FileText aria-hidden="true" size={18} />
                Documents
              </button>
              {canManageOrganization && (
                <button
                  type="button"
                  aria-current={pathname === "/settings" ? "page" : undefined}
                  onClick={() => navigate("/settings")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    pathname === "/settings"
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Settings aria-hidden="true" size={18} />
                  Organization settings
                </button>
              )}
            </nav>
          </div>

          <div className="mt-auto pt-10">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="truncate text-sm font-semibold text-slate-800">
                {organizationName}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">{userEmail}</p>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
          />
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
              >
                {mobileMenuOpen ? (
                  <X aria-hidden="true" size={20} />
                ) : (
                  <Menu aria-hidden="true" size={20} />
                )}
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">Workspace</p>
                <p className="truncate text-xs text-slate-500">{organizationName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-56 truncate text-sm font-medium text-slate-800">
                  {userEmail}
                </p>
                <p className="text-xs text-slate-500">Signed in</p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                disabled={isSigningOut}
                onClick={handleSignOut}
                type="button"
              >
                <LogOut aria-hidden="true" size={16} />
                {isSigningOut ? "Signing out..." : "Log out"}
              </button>
            </div>
          </header>

          <div>
            {error && (
              <div className="px-4 pt-5 sm:px-6 lg:px-8">
                <p
                  className="mx-auto max-w-[1600px] rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
