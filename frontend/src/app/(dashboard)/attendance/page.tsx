"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyStateIllustration } from "@/components/shared/empty-state-illustration";
import { listEmployees, type Employee } from "@/lib/employee-client";
import {
  AttendanceApiError,
  createAttendance,
  deleteAttendance,
  listAttendance,
  updateAttendance,
  type Attendance,
  type AttendanceStatus,
} from "@/lib/attendance-client";

const statuses: AttendanceStatus[] = ["present", "late", "half_day", "absent"];

function todayString() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function employeeName(attendance: Attendance) {
  if (typeof attendance.employeeId === "string") return "Employee";
  return `${attendance.employeeId.firstName} ${attendance.employeeId.lastName}`;
}

function employeeCode(attendance: Attendance) {
  return typeof attendance.employeeId === "string"
    ? "—"
    : attendance.employeeId.employeeCode;
}

function formatTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AttendancePage() {
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const token = session?.accessToken;
  const role = session?.profile.user.role;
  const isEmployee = role === "employee";
  const canEditAttendance = ["owner", "admin", "hr"].includes(role ?? "");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(todayString);
  const [status, setStatus] = useState<AttendanceStatus>("present");
  const [checkIn, setCheckIn] = useState("09:00");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState(todayString);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !session) router.replace("/login");
  }, [authLoading, router, session]);

  const loadEmployees = useCallback(async () => {
    if (!token || isEmployee) return;
    const result = await listEmployees(token, { status: "active", limit: 100 });
    setEmployees(result.employees);
    setEmployeeId((current) => current || result.employees[0]?._id || "");
  }, [isEmployee, token]);

  const loadAttendance = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listAttendance(token, {
        search: search.trim() || undefined,
        date: filterDate || undefined,
        status: (filterStatus || undefined) as AttendanceStatus | undefined,
        page,
        limit: 10,
        self: isEmployee,
      });
      setRecords(result.items);
      setTotal(result.pagination.total);
      setTotalPages(Math.max(1, result.pagination.totalPages));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load attendance records.",
      );
    } finally {
      setLoading(false);
    }
  }, [isEmployee, token, search, filterDate, filterStatus, page]);

  useEffect(() => {
    if (!token || isEmployee) return;
    const timer = window.setTimeout(() => {
      void loadEmployees().catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Unable to load employees.");
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isEmployee, token, loadEmployees]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => {
      void loadAttendance();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [token, loadAttendance]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !employeeId) {
      setError("Please add an active employee before recording attendance.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const payload: Parameters<typeof createAttendance>[1] = {
        employeeId,
        attendanceDate,
        status,
        notes: notes.trim() || undefined,
      };

      if (checkIn) {
        payload.checkIn = new Date(`${attendanceDate}T${checkIn}:00`).toISOString();
      }
      if (checkOut) {
        payload.checkOut = new Date(`${attendanceDate}T${checkOut}:00`).toISOString();
      }

      await createAttendance(token, payload);
      setNotice("Attendance recorded successfully.");
      setNotes("");
      setCheckOut("");
      setPage(1);
      setFilterDate(attendanceDate);
      await loadAttendance();
    } catch (cause) {
      setError(
        cause instanceof AttendanceApiError
          ? cause.message
          : cause instanceof Error
            ? cause.message
            : "Unable to save attendance.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckOut(record: Attendance) {
    if (!token) return;
    if (record.checkOut) {
      setError("This attendance record already has a check-out time.");
      return;
    }

    const time = new Date().toISOString();
    if (
      record.checkIn &&
      new Date(time).getTime() < new Date(record.checkIn).getTime()
    ) {
      setError("Check-out cannot be earlier than check-in.");
      return;
    }

    setBusyId(record._id);
    setError(null);
    setNotice(null);
    try {
      await updateAttendance(token, record._id, { checkOut: time });
      setNotice(`Check-out saved for ${employeeName(record)}.`);
      await loadAttendance();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to record check-out.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(record: Attendance) {
    if (!token || !window.confirm(`Delete attendance for ${employeeName(record)} on ${record.attendanceDate}?`)) {
      return;
    }

    setBusyId(record._id);
    setError(null);
    setNotice(null);
    try {
      await deleteAttendance(token, record._id);
      setNotice("Attendance record deleted.");
      await loadAttendance();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete attendance.");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading || !session) {
    return (
      <main aria-busy="true" className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Checking your session...</p>
      </main>
    );
  }

  const presentCount = records.filter((record) => record.status === "present").length;
  const lateCount = records.filter((record) => record.status === "late").length;
  const absentCount = records.filter((record) => record.status === "absent").length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">HRMPro workspace</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
              <CalendarDays aria-hidden="true" size={24} className="text-blue-700" />
              {isEmployee ? "My Attendance" : "Attendance Management"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isEmployee
                ? "Review your attendance records."
                : "Record daily attendance and review authorized team records."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="hrm-button-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft aria-hidden="true" size={16} />Back to Dashboard
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {notice}
          </p>
        )}

        <section aria-label="Attendance summary" className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Filtered records", value: total, description: "Records matching current filters" },
            { label: "Present on page", value: presentCount, description: "Present employees in this page" },
            { label: "Late on page", value: lateCount, description: "Late arrivals in this page" },
            { label: "Absent on page", value: absentCount, description: "Absent employees in this page" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            </div>
          ))}
        </section>

        {canEditAttendance && <section className="mb-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Plus aria-hidden="true" className="text-blue-700" size={18} />Record attendance</h2>
          <p className="mt-1 text-sm text-slate-500">Add one attendance record for an employee and date.</p>

          {employees.length === 0 && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              No active employees found. Add or activate an employee before recording attendance.
            </p>
          )}

          <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="block text-sm font-medium text-slate-700">
              Employee
              <select
                required
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.employeeCode} — {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Attendance date
              <input
                type="date"
                required
                value={attendanceDate}
                onChange={(event) => setAttendanceDate(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as AttendanceStatus)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Check-in time
              <input
                type="time"
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Check-out time
              <input
                type="time"
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Notes (optional)
              <input
                type="text"
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add a note"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>

            <div className="sm:col-span-2 xl:col-span-3">
              <button
                type="submit"
                disabled={saving || employees.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 aria-hidden="true" size={16} />
                {saving ? "Saving attendance..." : "Save attendance"}
              </button>
            </div>
          </form>
        </section>}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Attendance records</h2>
            <p className="mt-1 text-sm text-slate-500">Search and filter attendance by date or status.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {!isEmployee && <label className="block text-sm font-medium text-slate-700">
                Search employee
                <div className="relative mt-1.5">
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Name, code, or email"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm"
                  />
                </div>
              </label>}
              <label className="block text-sm font-medium text-slate-700">
                Filter date
                <div className="relative mt-1.5">
                  <Filter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    aria-label="Filter by date"
                    value={filterDate}
                    onChange={(event) => {
                      setFilterDate(event.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm"
                  />
                </div>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Filter status
                <div className="relative mt-1.5">
                  <Filter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    aria-label="Filter by status"
                    value={filterStatus}
                    onChange={(event) => {
                      setFilterStatus(event.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm"
                  >
                    <option value="">All statuses</option>
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterDate("");
                setFilterStatus("");
                setPage(1);
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <RefreshCw aria-hidden="true" size={16} />Clear filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[950px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Employee</th>
                  <th className="px-5 py-3 font-semibold">Code</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Check-in</th>
                  <th className="px-5 py-3 font-semibold">Check-out</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">Loading attendance...</td></tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      {!error && (
                        <EmptyStateIllustration
                          alt="An empty folder representing no matching attendance records."
                          className="mx-auto mb-2 h-16 w-20 object-contain"
                        />
                      )}
                      No attendance records found for these filters.
                    </td>
                  </tr>
                ) : records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">{employeeName(record)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employeeCode(record)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{record.attendanceDate}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatTime(record.checkIn)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatTime(record.checkOut)}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        record.status === "present" ? "bg-emerald-50 text-emerald-700" :
                        record.status === "late" ? "bg-amber-50 text-amber-700" :
                        record.status === "absent" ? "bg-red-50 text-red-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        {record.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-3">
                        {canEditAttendance && !record.checkOut && record.checkIn && (
                          <button
                            type="button"
                            disabled={busyId === record._id}
                            onClick={() => void handleCheckOut(record)}
                            className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-900 disabled:opacity-50"
                          >
                            <CheckCircle2 aria-hidden="true" size={16} />
                            {busyId === record._id ? "Saving..." : "Check out"}
                          </button>
                        )}
                        {canEditAttendance && <button
                          type="button"
                          disabled={busyId === record._id}
                          onClick={() => void handleDelete(record)}
                          className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <Trash2 aria-hidden="true" size={16} />Delete
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {total} record{total === 1 ? "" : "s"} · Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-40"
              >
                <ArrowLeft aria-hidden="true" size={16} />Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-40"
              >
                Next<ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-5 text-xs text-slate-500">
          HRMPro · Attendance management
        </footer>
      </div>
    </main>
  );
}
