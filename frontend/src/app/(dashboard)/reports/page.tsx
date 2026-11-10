"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyStateIllustration } from "@/components/shared/empty-state-illustration";
import {
  getOrganizationReport,
  type OrganizationReport,
} from "@/lib/reports-client";

type BarChartProps = {
  title: string;
  entries: { month: string; count: number }[];
  color: string;
  label: string;
};

type BreakdownProps = {
  title: string;
  entries: { status: string; count: number }[];
};

function maximum(values: number[]) {
  return Math.max(...values, 1);
}

function BarChart({ title, entries, color, label }: BarChartProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No data available for this period.</p>
      ) : (
        <div className="mt-5 flex min-h-40 items-end gap-3 overflow-x-auto">
          {entries.map((entry) => (
            <div
              key={entry.month}
              className="flex min-w-14 flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-slate-600">{entry.count}</span>
              <div
                className={`w-full rounded-t ${color}`}
                style={{
                  height: `${Math.max(8, (entry.count / maximum(entries.map((item) => item.count))) * 112)}px`,
                }}
                role="img"
                aria-label={`${entry.month}: ${entry.count} ${label}`}
              />
              <span className="text-center text-[11px] text-slate-500">
                {entry.month}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Breakdown({ title, entries }: BreakdownProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No records available.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.status}
              className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
            >
              <span className="text-sm capitalize text-slate-600">
                {entry.status.replace(/[_-]/g, " ")}
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900">
                {entry.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [report, setReport] = useState<OrganizationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const role = session?.profile.user.role;
  const canViewReports = ["owner", "admin", "hr"].includes(role ?? "");

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!canViewReports) {
      router.replace("/dashboard");
    }
  }, [session, canViewReports, router]);

  useEffect(() => {
    if (!session || !canViewReports) return;

    let active = true;
    void getOrganizationReport(session.accessToken, {
      from: from || undefined,
      to: to || undefined,
    })
      .then((result) => {
        if (active) setReport(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : "Unable to load HR reports.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session, canViewReports, from, to]);

  if (!session || !canViewReports) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Checking report access...</p>
      </main>
    );
  }

  const kpis = [
    { label: "Total employees", value: report?.employees.total },
    { label: "Active employees", value: report?.employees.active },
    { label: "Inactive employees", value: report?.employees.inactive },
    { label: "Employees on leave", value: report?.employees.onLeave },
    { label: "Attendance records", value: report?.attendance.total },
    { label: "Leave requests", value: report?.leaves.total },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <ArrowLeft aria-hidden="true" size={16} />Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight">HR Reports</h1>
            <p className="mt-2 text-sm text-slate-500">
              Organization workforce, attendance and leave analytics.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (from || to) {
                setLoading(true);
                setError("");
                setFrom("");
                setTo("");
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw aria-hidden="true" size={16} />Reset date filters
          </button>
        </div>

        <section className="mb-6 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-medium text-slate-700">
            From
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => {
                if (event.target.value !== from) {
                  setLoading(true);
                  setError("");
                  setFrom(event.target.value);
                }
              }}
              className="mt-2 block rounded-lg border border-slate-300 bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            To
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                if (event.target.value !== to) {
                  setLoading(true);
                  setError("");
                  setTo(event.target.value);
                }
              }}
              className="mt-2 block rounded-lg border border-slate-300 bg-white px-3 py-2"
            />
          </label>
          {report && (
            <p className="self-end pb-2 text-xs text-slate-500">
              Report period: {report.range.from} to {report.range.to}
            </p>
          )}
        </section>

        {error && (
          <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading && (
          <p className="mb-6 text-sm text-slate-500" aria-live="polite">
            Loading organization reports...
          </p>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                {loading ? "…" : item.value ?? "—"}
              </p>
            </div>
          ))}
        </section>

        {!loading && !error && report && report.employees.total === 0 && (
          <div className="mb-6 flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center sm:flex-row sm:text-left">
            <EmptyStateIllustration
              alt="An empty folder representing an organization with no employee records yet."
              className="h-16 w-20 shrink-0 object-contain"
            />
            <p className="text-sm text-slate-600">
              No employee records yet. Add employees to start seeing organization analytics.
            </p>
          </div>
        )}

        {report && (
          <>
            <div className="mb-8 grid gap-5 lg:grid-cols-2">
              <BarChart
                title="Employee joining trends"
                entries={report.joiningTrends}
                color="bg-blue-600"
                label="employees joined"
              />
              <BarChart
                title="Monthly attendance"
                entries={report.attendance.monthly}
                color="bg-emerald-600"
                label="attendance records"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Breakdown
                title="Department distribution"
                entries={report.departments.map((item) => ({
                  status: item.department,
                  count: item.count,
                }))}
              />
              <Breakdown
                title="Attendance by status"
                entries={report.attendance.byStatus}
              />
              <Breakdown
                title="Leave requests by status"
                entries={report.leaves.byStatus}
              />
              <Breakdown
                title="Leave approvals"
                entries={report.leaves.approvals}
              />
            </div>
          </>
        )}

        {!loading && !error && !report && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
            <EmptyStateIllustration
              alt="An empty folder representing unavailable report data."
              className="mx-auto mb-2 h-16 w-20 object-contain"
            />
            No report data is available.
          </div>
        )}

        <footer className="mt-10 border-t border-slate-200 py-5 text-xs text-slate-500">
          HRMPro | Organization reports
        </footer>
      </div>
    </main>
  );
}
