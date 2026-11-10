"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, ClipboardCheck, UserCheck, Users } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyStateIllustration } from "@/components/shared/empty-state-illustration";
import {
  getOrganizationReport,
  type OrganizationReport,
} from "@/lib/reports-client";

export default function DashboardPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [report, setReport] = useState<OrganizationReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");

  const role = session?.profile.user.role;
  const canViewReports = ["owner", "admin", "hr"].includes(role ?? "");

  useEffect(() => {
    if (!session || !canViewReports) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setReportLoading(true);
      setReportError("");
      void getOrganizationReport(session.accessToken, {
        from: reportFrom || undefined,
        to: reportTo || undefined,
      })
        .then((result) => {
          if (active) setReport(result);
        })
        .catch((cause: unknown) => {
          if (active) {
            setReportError(
              cause instanceof Error ? cause.message : "Unable to load HR reports.",
            );
          }
        })
        .finally(() => {
          if (active) setReportLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [canViewReports, reportFrom, reportTo, session]);

  if (!session) {
    return (
      <main
        aria-busy="true"
        className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-6"
      >
        <p className="text-sm text-slate-600">Checking your session...</p>
      </main>
    );
  }

  const organizationName = session.profile.organization.name;
  const userEmail = session.profile.user.email;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="text-sm font-medium text-blue-700">HRMPro workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Organization overview, workforce KPIs and HR analytics.
          </p>
        </div>

        <section
          aria-label="Organization profile"
          className="mb-8 grid gap-4 sm:grid-cols-2"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Organization
            </p>
            <p className="mt-2 truncate text-lg font-semibold text-slate-900">
              {organizationName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Slug: {session.profile.organization.slug}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Signed-in account
            </p>
            <p className="mt-2 truncate text-lg font-semibold text-slate-900">
              {userEmail}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Your authenticated workspace session
            </p>
          </div>
        </section>

        {canViewReports ? (
          <section aria-label="HR analytics" className="mb-8 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">HR analytics</h2>
              <p className="mt-1 text-sm text-slate-500">
                {report
                  ? `Attendance and leave activity from ${report.range.from} through ${report.range.to}.`
                  : "Organization metrics from live HR records."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="text-sm font-medium text-slate-700">
                From
                <input
                  type="date"
                  value={reportFrom}
                  max={reportTo || undefined}
                  onChange={(event) => setReportFrom(event.target.value)}
                  className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                To
                <input
                  type="date"
                  value={reportTo}
                  min={reportFrom || undefined}
                  onChange={(event) => setReportTo(event.target.value)}
                  className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
              </label>
            </div>
            {reportError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {reportError}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total employees", value: report?.employees.total, icon: Users, tone: "bg-emerald-50 text-emerald-700" },
                { label: "Active employees", value: report?.employees.active, icon: UserCheck, tone: "bg-teal-50 text-teal-700" },
                { label: "Attendance records", value: report?.attendance.total, icon: CalendarCheck2, tone: "bg-sky-50 text-sky-700" },
                { label: "Leave requests", value: report?.leaves.total, icon: ClipboardCheck, tone: "bg-amber-50 text-amber-700" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {item.label}
                    </p>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${item.tone}`}>
                      <item.icon aria-hidden="true" size={18} strokeWidth={2} />
                    </span>
                  </div>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {reportLoading ? "…" : item.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
            {!reportLoading && !reportError && report && report.employees.total === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center sm:flex-row sm:text-left">
                <EmptyStateIllustration
                  alt="An empty folder representing an organization with no employee records yet."
                  className="h-16 w-20 shrink-0 object-contain"
                />
                <p className="text-sm text-slate-600">
                  No employee records yet. Add your first employee to start seeing HR
                  analytics.
                </p>
              </div>
            )}
            {report && report.joiningTrends.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">
                  Employee joining trends
                </h3>
                <div className="mt-4 flex min-h-32 items-end gap-3 overflow-x-auto">
                  {report.joiningTrends.map((entry) => {
                    const maximum = Math.max(
                      ...report.joiningTrends.map((item) => item.count),
                      1,
                    );
                    return (
                      <div
                        key={entry.month}
                        className="flex min-w-14 flex-1 flex-col items-center gap-2"
                      >
                        <span className="text-xs font-medium text-slate-600">
                          {entry.count}
                        </span>
                        <div
                          className="w-full rounded-t bg-blue-600"
                          style={{
                            height: `${Math.max(8, (entry.count / maximum) * 96)}px`,
                          }}
                          aria-label={`${entry.month}: ${entry.count} employees joined`}
                        />
                        <span className="text-[11px] text-slate-500">
                          {entry.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {report && report.attendance.monthly.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">
                  Monthly attendance
                </h3>
                <div className="mt-4 flex min-h-32 items-end gap-3 overflow-x-auto">
                  {report.attendance.monthly.map((entry) => {
                    const maximum = Math.max(
                      ...report.attendance.monthly.map((item) => item.count),
                      1,
                    );
                    return (
                      <div
                        key={entry.month}
                        className="flex min-w-14 flex-1 flex-col items-center gap-2"
                      >
                        <span className="text-xs font-medium text-slate-600">
                          {entry.count}
                        </span>
                        <div
                          className="w-full rounded-t bg-emerald-600"
                          style={{
                            height: `${Math.max(8, (entry.count / maximum) * 96)}px`,
                          }}
                          aria-label={`${entry.month}: ${entry.count} attendance records`}
                        />
                        <span className="text-[11px] text-slate-500">
                          {entry.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Your HR workspace</h2>
            <p className="mt-2 text-sm text-slate-600">
              View your attendance, submit leave requests, and manage your personal
              documents.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                ["Attendance", "/attendance"],
                ["Leave requests", "/leaves"],
                ["Documents", "/documents"],
              ].map(([label, path]) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => router.push(path)}
                  className="hrm-button-secondary"
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-10 border-t border-slate-200 py-5 text-xs text-slate-500">
          HRMPro | Organization overview
        </footer>
      </div>
    </main>
  );
}
