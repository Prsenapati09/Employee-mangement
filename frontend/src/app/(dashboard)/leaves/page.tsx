"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyStateIllustration } from "@/components/shared/empty-state-illustration";
import { listEmployees, type Employee } from "@/lib/employee-client";
import {
  cancelLeave,
  createLeave,
  listLeaves,
  reviewLeave,
  type Leave,
  type LeaveInput,
  type LeaveStatus,
  type LeaveType,
} from "@/lib/leave-client";

const leaveTypes: { value: LeaveType; label: string }[] = [
  { value: "casual", label: "Casual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "earned", label: "Earned Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
];

const statuses: LeaveStatus[] = ["pending", "approved", "rejected", "cancelled"];

function getEmployeeName(employeeId: Leave["employeeId"]) {
  if (typeof employeeId === "string") return "Employee";
  return `${employeeId.firstName} ${employeeId.lastName}`.trim();
}

function getEmployeeCode(employeeId: Leave["employeeId"]) {
  return typeof employeeId === "string" ? "—" : employeeId.employeeCode || "—";
}

function statusClasses(status: LeaveStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function todayString() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export default function LeavesPage() {
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const token = session?.accessToken;
  const role = session?.profile.user.role;
  const selfService = role === "employee" || role === "manager";
  const canCreateForOthers = ["owner", "admin", "hr"].includes(role ?? "");
  const canReview = [...["owner", "admin", "hr"], "manager"].includes(role ?? "");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | "">("");
  const [filterType, setFilterType] = useState<LeaveType | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [reviewingId, setReviewingId] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved");
  const [reviewTarget, setReviewTarget] = useState<Leave | null>(null);

  const [form, setForm] = useState<LeaveInput>({
    employeeId: "",
    leaveType: "casual",
    startDate: todayString(),
    endDate: todayString(),
    reason: "",
  });

  useEffect(() => {
    if (!authLoading && !session) router.replace("/login");
  }, [authLoading, session, router]);

  const loadEmployees = useCallback(async () => {
    if (!token || selfService) return;
    try {
      const result = await listEmployees(token, { status: "active", limit: 100 });
      setEmployees(result.employees);
      setForm((current) => ({
        ...current,
        employeeId: current.employeeId || result.employees[0]?._id || "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load employees.");
    }
  }, [selfService, token]);

  const loadLeaves = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await listLeaves(token, {
        search: search.trim() || undefined,
        status: filterStatus || undefined,
        leaveType: filterType || undefined,
        page,
        limit: 10,
        self: role === "employee",
      });
      setLeaves(result.items);
      setTotal(result.pagination.total);
      setTotalPages(Math.max(1, result.pagination.totalPages));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load leave requests.");
    } finally {
      setLoading(false);
    }
  }, [role, token, search, filterStatus, filterType, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEmployees();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadEmployees]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLeaves();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadLeaves]);

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createLeave(token, form, !canCreateForOthers);
      setNotice("Leave request submitted successfully.");
      setForm((current) => ({ ...current, reason: "" }));
      setPage(1);
      await loadLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit leave request.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(leave: Leave) {
    if (!token || !window.confirm("Cancel this pending leave request?")) return;
    setError("");
    setNotice("");
    try {
      await cancelLeave(token, leave._id, selfService);
      setNotice("Leave request cancelled.");
      await loadLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel leave request.");
    }
  }

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !reviewTarget) return;
    setReviewingId(reviewTarget._id);
    setError("");
    setNotice("");
    try {
      await reviewLeave(token, reviewTarget._id, {
        status: reviewStatus,
        reviewComment: reviewComment.trim() || undefined,
      });
      setNotice(`Leave request ${reviewStatus}.`);
      setReviewTarget(null);
      setReviewComment("");
      await loadLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to review leave request.");
    } finally {
      setReviewingId("");
    }
  }

  if (!session) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Checking your session...
      </main>
    );
  }

  const pendingCount = leaves.filter((leave) => leave.status === "pending").length;
  const approvedCount = leaves.filter((leave) => leave.status === "approved").length;
  const rejectedCount = leaves.filter((leave) => leave.status === "rejected").length;

  return (
    <main className="space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <button type="button" onClick={() => router.push("/dashboard")} className="hrm-button-secondary mb-4 inline-flex items-center gap-2"><ArrowLeft aria-hidden="true" size={16} />Back to Dashboard</button>
          <p className="text-sm font-medium text-blue-600">HRMPro / People</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {role === "employee" ? "My Leave Requests" : "Leave Management"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Submit, review and track employee leave requests.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadLeaves()}
          className="hrm-button-secondary inline-flex items-center gap-2"
        >
          <RefreshCw aria-hidden="true" size={16} />Refresh requests
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "All Requests", value: total, color: "text-slate-900" },
          { label: "Pending on This Page", value: pendingCount, color: "text-amber-700" },
          { label: "Approved on This Page", value: approvedCount, color: "text-emerald-700" },
          { label: "Rejected on This Page", value: rejectedCount, color: "text-red-700" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Apply for Leave</h2>
        <p className="mt-1 text-sm text-slate-500">
          {canCreateForOthers
            ? "Create a new leave request for an active employee."
            : "Submit a leave request for your own employee profile."}
        </p>

        <form onSubmit={handleApply} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {canCreateForOthers && <label className="block text-sm font-medium text-slate-700">
            Employee
            <select
              required
              value={form.employeeId}
              onChange={(event) => setForm({ ...form, employeeId: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName} ({employee.employeeCode})
                </option>
              ))}
            </select>
          </label>}

          <label className="block text-sm font-medium text-slate-700">
            Leave Type
            <select
              value={form.leaveType}
              onChange={(event) => setForm({ ...form, leaveType: event.target.value as LeaveType })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {leaveTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Start Date
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            End Date
            <input
              required
              type="date"
              min={form.startDate}
              value={form.endDate}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Reason
            <textarea
              required
              minLength={3}
              maxLength={1000}
              rows={2}
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              placeholder="Enter the reason for leave"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving || (canCreateForOthers && !employees.length)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus aria-hidden="true" size={16} />
              {saving ? "Submitting..." : "Submit Leave Request"}
            </button>
          </div>
        </form>
        {canCreateForOthers && !employees.length && (
          <p className="mt-3 text-sm text-amber-700">No active employees found. Add or activate an employee before applying.</p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Leave Requests</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                aria-label="Search leave requests"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Search employee name, code or email"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <Filter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                aria-label="Filter by status"
                value={filterStatus}
                onChange={(event) => { setFilterStatus(event.target.value as LeaveStatus | ""); setPage(1); }}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All statuses</option>
                {statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="relative">
              <Filter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                aria-label="Filter by leave type"
                value={filterType}
                onChange={(event) => { setFilterType(event.target.value as LeaveType | ""); setPage(1); }}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All leave types</option>
                {leaveTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="p-10 text-center">
            {!error && (
              <EmptyStateIllustration
                alt="An empty folder representing no matching leave requests."
                className="mx-auto mb-2 h-16 w-20 object-contain"
              />
            )}
            <p className="font-semibold text-slate-800">No leave requests found</p>
            <p className="mt-1 text-sm text-slate-500">Try changing the filters or submit a new request.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Employee</th>
                  <th className="px-5 py-3 font-semibold">Leave Type</th>
                  <th className="px-5 py-3 font-semibold">Dates</th>
                  <th className="px-5 py-3 font-semibold">Days</th>
                  <th className="px-5 py-3 font-semibold">Reason</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="align-top hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{getEmployeeName(leave.employeeId)}</p>
                      <p className="mt-1 text-xs text-slate-500">{getEmployeeCode(leave.employeeId)}</p>
                    </td>
                    <td className="px-5 py-4 capitalize text-slate-700">{leave.leaveType.replace("_", " ")}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {leave.startDate} <span className="text-slate-400">to</span> {leave.endDate}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{leave.totalDays}</td>
                    <td className="max-w-[220px] whitespace-normal px-5 py-4 text-slate-600">
                      <p>{leave.reason}</p>
                      {leave.reviewComment && <p className="mt-1 text-xs text-slate-500">Review: {leave.reviewComment}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {leave.status === "pending" ? (
                        <div className="flex flex-wrap gap-2">
                          {canReview && <button
                            type="button"
                            onClick={() => { setReviewTarget(leave); setReviewStatus("approved"); setReviewComment(""); }}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 aria-hidden="true" size={14} />Review
                          </button>}
                          {(!selfService || (
                            typeof leave.employeeId !== "string" &&
                            leave.employeeId.email === session.profile.user.email
                          )) && <button
                            type="button"
                            onClick={() => void handleCancel(leave)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <XCircle aria-hidden="true" size={14} />Cancel
                          </button>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">{total} total requests · Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              <ArrowLeft aria-hidden="true" size={16} />Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              Next<ArrowRight aria-hidden="true" size={16} />
            </button>
          </div>
        </div>
      </section>

      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="review-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="review-title" className="text-lg font-bold text-slate-900">Review Leave Request</h2>
            <p className="mt-1 text-sm text-slate-500">
              {getEmployeeName(reviewTarget.employeeId)} · {reviewTarget.startDate} to {reviewTarget.endDate}
            </p>
            <form onSubmit={handleReview} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Decision
                <select
                  value={reviewStatus}
                  onChange={(event) => setReviewStatus(event.target.value as "approved" | "rejected")}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Comment (optional)
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Add a review comment"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReviewTarget(null)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                  <X aria-hidden="true" size={16} />Close
                </button>
                <button type="submit" disabled={reviewingId === reviewTarget._id} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${reviewStatus === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
                  {reviewStatus === "approved" ? <CheckCircle2 aria-hidden="true" size={16} /> : <XCircle aria-hidden="true" size={16} />}
                  {reviewingId === reviewTarget._id ? "Saving..." : "Save Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
