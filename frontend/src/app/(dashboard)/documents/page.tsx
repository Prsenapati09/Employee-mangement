"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyStateIllustration } from "@/components/shared/empty-state-illustration";
import {
  getOwnEmployee,
  listEmployees,
  type Employee,
} from "@/lib/employee-client";
import {
  deleteEmployeeDocument,
  downloadEmployeeDocument,
  listEmployeeDocuments,
  uploadEmployeeDocument,
  type EmployeeDocument,
  type EmployeeDocumentCategory,
} from "@/lib/document-client";

const categories: { value: EmployeeDocumentCategory; label: string }[] = [
  { value: "identity", label: "Identity" },
  { value: "contract", label: "Contract" },
  { value: "resume", label: "Resume" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
]);

export default function DocumentsPage() {
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const token = session?.accessToken;
  const role = session?.profile.user.role;
  const isEmployee = role === "employee";
  const canDelete = ["owner", "admin", "hr"].includes(role ?? "");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<EmployeeDocumentCategory>("other");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyDocument, setBusyDocument] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !session) router.replace("/login");
  }, [authLoading, router, session]);

  const loadEmployees = useCallback(async () => {
    if (!token) return;
    try {
      if (isEmployee) {
        const ownEmployee = await getOwnEmployee(token);
        setEmployees([ownEmployee]);
        setEmployeeId(ownEmployee._id);
      } else {
        const result = await listEmployees(token, { status: "active", limit: 100 });
        setEmployees(result.employees);
        setEmployeeId((current) => current || result.employees[0]?._id || "");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load employees.");
    }
  }, [isEmployee, token]);

  const loadDocuments = useCallback(async () => {
    if (!token || !employeeId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setDocuments(await listEmployeeDocuments(token, employeeId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, [employeeId, token]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => void loadEmployees(), 0);
    return () => window.clearTimeout(timer);
  }, [loadEmployees, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDocuments(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDocuments, refreshKey]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !employeeId || !file) return;
    if (!allowedTypes.has(file.type)) {
      setError("Choose a PDF, PNG, JPEG, or plain-text file.");
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError("Choose a file smaller than 5 MB.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await uploadEmployeeDocument(token, employeeId, file, category);
      setFile(null);
      event.currentTarget.reset();
      setNotice("Document uploaded securely.");
      setRefreshKey((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to upload this document.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload(document: EmployeeDocument) {
    if (!token) return;
    setBusyDocument(document.id);
    setError("");
    try {
      const result = await downloadEmployeeDocument(token, document.id);
      const url = URL.createObjectURL(result.blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to download this document.");
    } finally {
      setBusyDocument("");
    }
  }

  async function handleDelete(document: EmployeeDocument) {
    if (!token || !canDelete) return;
    if (!window.confirm(`Permanently delete "${document.filename}"?`)) return;
    setBusyDocument(document.id);
    setError("");
    setNotice("");
    try {
      await deleteEmployeeDocument(token, document.id);
      setNotice("Document deleted.");
      setRefreshKey((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete this document.");
    } finally {
      setBusyDocument("");
    }
  }

  if (authLoading || !session) {
    return <main className="p-8 text-center text-sm text-slate-500">Checking your session...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">HRMPro workspace</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight"><FileText aria-hidden="true" className="text-blue-700" size={24} />Employee documents</h1>
          <p className="mt-2 text-sm text-slate-600">
            Private, organization-scoped files are only available to authorized users.
          </p>
        </div>
        <button type="button" className="hrm-button-secondary inline-flex items-center gap-2" onClick={() => router.push("/dashboard")}>
          <ArrowLeft aria-hidden="true" size={16} />Back to dashboard
        </button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      {!isEmployee && (
        <label className="block max-w-md text-sm font-medium text-slate-700">
          Employee
          <select
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            <option value="">Select an employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.employeeCode} — {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </label>
      )}

      {employeeId && role !== "manager" && (
        <form onSubmit={handleUpload} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Document file
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              required
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm"
            />
            <span className="mt-1 block text-xs text-slate-500">PDF, PNG, JPEG or TXT; up to 5 MB.</span>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as EmployeeDocumentCategory)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={saving || !file} className="hrm-button-primary inline-flex items-center gap-2 disabled:opacity-50">
              <Upload aria-hidden="true" size={16} />
              {saving ? "Uploading..." : "Upload document"}
            </button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Stored documents</h2>
        </div>
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading documents...</p>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {employeeId && !error && (
              <EmptyStateIllustration
                alt="An empty folder representing no documents for this employee."
                className="mx-auto mb-2 h-16 w-20 object-contain"
              />
            )}
            <p>{employeeId ? "No documents have been added for this employee." : "Select an employee to view documents."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {documents.map((document) => (
              <li key={document.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{document.filename}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {document.category} · {(document.size / 1024).toFixed(1)} KB · {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={busyDocument === document.id} onClick={() => void handleDownload(document)} className="hrm-button-secondary inline-flex items-center gap-2">
                    <Download aria-hidden="true" size={16} />Download
                  </button>
                  {canDelete && (
                    <button type="button" disabled={busyDocument === document.id} onClick={() => void handleDelete(document)} className="hrm-button-secondary inline-flex items-center gap-2 text-red-700 hover:bg-red-50 hover:text-red-800">
                      <Trash2 aria-hidden="true" size={16} />Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
