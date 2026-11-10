"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Filter,
  Pencil,
  Plus,
  Search,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyStateIllustration } from "@/components/shared/empty-state-illustration";
import {
  createDepartment,
  deleteDepartment,
  DepartmentApiError,
  listDepartments,
  updateDepartment,
  type Department,
  type DepartmentInput,
  type DepartmentStatus,
} from "@/lib/department-client";

const emptyForm: DepartmentInput = {
  name: "",
  description: "",
  status: "active",
};

export default function DepartmentsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const canManageDepartments = ["owner", "admin", "hr"].includes(
    session?.profile.user.role ?? "",
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | DepartmentStatus>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<DepartmentInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadDepartments = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const result = await listDepartments(session.accessToken, {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setDepartments(result.departments);
      setTotal(result.pagination.total);
      setTotalPages(Math.max(1, result.pagination.totalPages));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load departments.",
      );
    } finally {
      setLoading(false);
    }
  }, [session, search, statusFilter, page]);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      void loadDepartments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [session, router, loadDepartments]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setNotice(null);
    setShowForm(true);
  }

  function startEdit(department: Department) {
    setEditingId(department._id);
    setForm({
      name: department.name,
      description: department.description ?? "",
      status: department.status,
    });
    setError(null);
    setNotice(null);
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    const input: DepartmentInput = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      status: form.status ?? "active",
    };

    try {
      if (editingId) {
        await updateDepartment(session.accessToken, editingId, input);
        setNotice("Department updated successfully.");
      } else {
        await createDepartment(session.accessToken, input);
        setNotice("Department created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setPage(1);
      await loadDepartments();
    } catch (err) {
      setError(
        err instanceof DepartmentApiError || err instanceof Error
          ? err.message
          : "Unable to save department.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(department: Department) {
    if (!session) return;

    const confirmed = window.confirm(
      `Delete the "${department.name}" department? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    setNotice(null);

    try {
      await deleteDepartment(session.accessToken, department._id);
      setNotice("Department deleted successfully.");
      if (departments.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadDepartments();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete department.",
      );
    }
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Checking your session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="hrm-button-secondary mb-4 inline-flex items-center gap-2"
            >
              <ArrowLeft aria-hidden="true" size={16} />Back to Dashboard
            </button>
            <p className="text-sm font-medium text-blue-700">HRMPro workspace</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight"><Building2 aria-hidden="true" className="text-blue-700" size={24} />Departments</h1>
            <p className="mt-2 text-sm text-slate-600">
              Organize teams and manage department details.
            </p>
          </div>
          {canManageDepartments && <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Plus aria-hidden="true" size={18} />Add department
          </button>}
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        {showForm && canManageDepartments && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit department" : "Add a department"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                <X aria-hidden="true" size={16} />Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Department name <span className="text-red-600">*</span>
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="e.g. Human Resources"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Status
                <select
                  value={form.status ?? "active"}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as DepartmentStatus,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                Description
                <textarea
                  maxLength={500}
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Briefly describe this department"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingId ? <Save aria-hidden="true" size={16} /> : <Plus aria-hidden="true" size={16} />}
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create department"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-semibold">All departments</h2>
              <p className="mt-1 text-sm text-slate-500">
                {total} {total === 1 ? "department" : "departments"} in your organization
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search departments..."
                  aria-label="Search departments"
                  className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                />
              </div>
              <div className="relative">
                <Filter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as "" | DepartmentStatus);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Department</th>
                  <th className="px-5 py-3.5 font-semibold">Description</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Created</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      Loading departments...
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      {!error && (
                        <EmptyStateIllustration
                          alt="An empty folder representing no matching departments."
                          className="mx-auto mb-2 h-16 w-20 object-contain"
                        />
                      )}
                      <p className="font-medium text-slate-800">No departments found</p>
                      <p className="mt-1 text-slate-500">
                        Add a department or change your search filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department._id} className="transition hover:bg-blue-50/40">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{department.name}</p>
                      </td>
                      <td className="max-w-sm px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {department.description || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          department.status === "active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : "bg-slate-100 text-slate-600 ring-slate-500/20"
                        }`}>
                          {department.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {new Date(department.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-3">
                          {canManageDepartments && (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(department)}
                                className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-900"
                              >
                                <Pencil aria-hidden="true" size={16} />Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(department)}
                                className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-800"
                              >
                                <Trash2 aria-hidden="true" size={16} />Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft aria-hidden="true" size={16} />Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next<ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
