"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyStateIllustration } from "@/components/shared/empty-state-illustration";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Filter,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  inviteEmployee,
  listEmployees,
  updateEmployee,
  type Employee,
  type EmployeeInput,
  type EmployeeStatus,
} from "@/lib/employee-client";

const emptyForm: EmployeeInput = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  jobTitle: "",
  dateOfJoining: "",
  status: "active",
};

const statusLabels: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On leave",
};

export default function EmployeeManagement() {
  const { session } = useAuth();
  const canManageEmployees = ["owner", "admin", "hr"].includes(
    session?.profile.user.role ?? "",
  );
  const token = session?.accessToken;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [details, setDetails] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadEmployees = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await listEmployees(token, {
        search: search.trim() || undefined,
        status: (statusFilter || undefined) as EmployeeStatus | undefined,
        page,
        limit: 10,
      });
      setEmployees(result.employees);
      setTotal(result.pagination.total);
      setTotalPages(Math.max(result.pagination.totalPages, 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadEmployees(), 250);
    return () => window.clearTimeout(timer);
  }, [loadEmployees, refreshKey]);

  function openCreateForm() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
    setDetails(null);
    setError("");
    setNotice("");
  }

  function openEditForm(employee: Employee) {
    setEditing(employee);
    setForm({
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || "",
      department: employee.department || "",
      jobTitle: employee.jobTitle || "",
      dateOfJoining: employee.dateOfJoining
        ? employee.dateOfJoining.slice(0, 10)
        : "",
      status: employee.status,
    });
    setFormOpen(true);
    setDetails(null);
    setError("");
    setNotice("");
  }

  async function openDetails(employee: Employee) {
    if (!token) return;
    setError("");
    setNotice("");
    try {
      const fullEmployee = await getEmployee(token, employee._id);
      setDetails(fullEmployee);
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load employee details.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setNotice("");

    const payload: EmployeeInput = {
      ...form,
      employeeCode: form.employeeCode.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone?.trim() || undefined,
      department: form.department?.trim() || undefined,
      jobTitle: form.jobTitle?.trim() || undefined,
      dateOfJoining: form.dateOfJoining || undefined,
    };

    try {
      if (editing) {
        await updateEmployee(token, editing._id, payload);
        setNotice("Employee updated successfully.");
      } else {
        await createEmployee(token, payload);
        setNotice("Employee added successfully.");
        setPage(1);
      }
      setFormOpen(false);
      setEditing(null);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save employee.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee: Employee) {
    if (!token) return;
    const confirmed = window.confirm(
      `Delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setError("");
    setNotice("");
    try {
      await deleteEmployee(token, employee._id);
      setNotice("Employee deleted successfully.");
      if (details?._id === employee._id) setDetails(null);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete employee.");
    }
  }

  async function handleInvite(employee: Employee) {
    if (!token) return;
    setInvitingId(employee._id);
    setError("");
    setNotice("");
    try {
      await inviteEmployee(token, employee._id);
      setNotice(`Invitation email sent to ${employee.email}.`);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send invitation.");
    } finally {
      setInvitingId(null);
    }
  }
  function closePanels() {
    setFormOpen(false);
    setEditing(null);
    setDetails(null);
    setError("");
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Employee Management
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage employee records for your organization.
          </p>
        </div>
        {canManageEmployees && <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Plus aria-hidden="true" size={18} />
          Add employee
        </button>}
      </div>

      {notice && (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total employees</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Current page</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{page} / {totalPages}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Showing</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{employees.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            aria-label="Search employees"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, code, department..."
            className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="relative">
          <Filter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm sm:w-auto"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On leave</option>
          </select>
        </div>
      </div>

      {formOpen && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              {editing ? "Edit employee" : "Add employee"}
            </h3>
            <button type="button" onClick={closePanels} className="text-sm text-slate-600 hover:text-slate-900">
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Employee code *
              <input required maxLength={50} value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              First name *
              <input required maxLength={100} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Last name *
              <input required maxLength={100} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email *
              <input required type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Phone
              <input maxLength={30} value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Department
              <input maxLength={100} value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Job title
              <input maxLength={100} value={form.jobTitle || ""} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Date of joining
              <input type="date" value={form.dateOfJoining || ""} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Status
              <select value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
              </select>
            </label>
            <div className="flex items-end gap-3 sm:col-span-2">
              <button disabled={saving} type="submit" className="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                {saving ? "Saving..." : editing ? "Save changes" : "Create employee"}
              </button>
              <button type="button" onClick={closePanels} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {details && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {details.firstName} {details.lastName}
              </h3>
              <p className="text-sm text-slate-600">{details.jobTitle || "No job title"} · {details.employeeCode}</p>
            </div>
            <button type="button" onClick={closePanels} className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"><X aria-hidden="true" size={16} />Close details</button>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Email", details.email],
              ["Phone", details.phone || "—"],
              ["Department", details.department || "—"],
              ["Job title", details.jobTitle || "—"],
              ["Status", statusLabels[details.status]],
              ["Date of joining", details.dateOfJoining ? new Date(details.dateOfJoining).toLocaleDateString() : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex gap-2">
            {canManageEmployees && (
              <>
                <button type="button" onClick={() => openEditForm(details)} className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"><Pencil aria-hidden="true" size={16} />Edit</button>
                <button type="button" onClick={() => void handleDelete(details)} className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"><Trash2 aria-hidden="true" size={16} />Delete</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-100/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Loading employees...</td></tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    {!error && (
                      <EmptyStateIllustration
                        alt="An empty folder representing no matching employee records."
                        className="mx-auto mb-2 h-16 w-20 object-contain"
                      />
                    )}
                    <p>No employees found. Add an employee or adjust your search.</p>
                  </td>
                </tr>
              ) : employees.map((employee) => (
                <tr key={employee._id} className="transition-colors hover:bg-blue-50/40">
                  <td className="px-4 py-4 align-middle">
                    <p className="font-medium text-slate-900">{employee.firstName} {employee.lastName}</p>
                    <p className="mt-1 text-xs text-slate-500">{employee.employeeCode} · {employee.email}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{employee.department || "—"}</td>
                  <td className="px-4 py-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${employee.status === "active" ? "bg-green-50 text-green-700 ring-green-600/20" : employee.status === "inactive" ? "bg-slate-100 text-slate-600 ring-slate-500/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"}`}>
                      {statusLabels[employee.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <button type="button" onClick={() => void openDetails(employee)} className="inline-flex items-center gap-1.5 font-medium text-blue-700 transition-colors hover:text-blue-900 hover:underline"><Eye aria-hidden="true" size={16} />View</button>
                      {canManageEmployees && (employee.userId ? (
                        <span className="text-xs font-medium text-green-700">Account linked</span>
                      ) : employee.status === "active" ? (
                        <button type="button" disabled={invitingId === employee._id} onClick={() => void handleInvite(employee)} className="font-medium text-indigo-700 hover:underline disabled:opacity-50">
                          <Mail aria-hidden="true" size={16} />{invitingId === employee._id ? "Sending..." : "Send invitation"}
                        </button>
                      ) : null)}
                      {canManageEmployees && (
                        <>
                          <button type="button" onClick={() => openEditForm(employee)} className="inline-flex items-center gap-1.5 font-medium text-slate-700 transition-colors hover:text-slate-900 hover:underline"><Pencil aria-hidden="true" size={16} />Edit</button>
                          <button type="button" onClick={() => void handleDelete(employee)} className="inline-flex items-center gap-1.5 font-medium text-red-700 transition-colors hover:text-red-800 hover:underline"><Trash2 aria-hidden="true" size={16} />Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">Page {page} of {totalPages} · {total} employees</p>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft aria-hidden="true" size={16} />Previous</button>
            <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next<ArrowRight aria-hidden="true" size={16} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
