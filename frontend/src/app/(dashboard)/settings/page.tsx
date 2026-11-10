"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, CheckCircle2, Save } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getOrganizationSettings,
  listManagedUsers,
  updateManagedUserStatus,
  updateOrganizationName,
  type ManagedUser,
  type OrganizationSettings,
} from "@/lib/admin-client";

export default function SettingsPage() {
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const token = session?.accessToken;
  const userId = session?.profile.user.id;
  const role = session?.profile.user.role;
  const canManage = role === "owner" || role === "admin";
  const [organization, setOrganization] = useState<OrganizationSettings | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSettings = useCallback(async () => {
    if (!token || !canManage) return;
    setLoading(true);
    setError("");
    try {
      const [organizationResult, usersResult] = await Promise.all([
        getOrganizationSettings(token),
        listManagedUsers(token),
      ]);
      setOrganization(organizationResult);
      setName(organizationResult.name);
      setUsers(usersResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  }, [canManage, token]);

  useEffect(() => {
    if (!authLoading && !session) router.replace("/login");
  }, [authLoading, router, session]);

  useEffect(() => {
    if (!token || !canManage) return;
    const timer = window.setTimeout(() => void loadSettings(), 0);
    return () => window.clearTimeout(timer);
  }, [canManage, loadSettings, token]);

  async function handleSaveOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSavingName(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateOrganizationName(token, name.trim());
      setOrganization(updated);
      setName(updated.name);
      setNotice("Organization settings updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update organization settings.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleStatusChange(user: ManagedUser) {
    if (!token || user._id === userId || user.role === "owner") return;
    const nextStatus = user.status === "active" ? "suspended" : "active";
    if (
      nextStatus === "suspended" &&
      !window.confirm(`Suspend access for ${user.email}? Existing sessions will be revoked.`)
    ) {
      return;
    }
    setBusyUserId(user._id);
    setError("");
    setNotice("");
    try {
      const updated = await updateManagedUserStatus(token, user._id, nextStatus);
      setUsers((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
      setNotice(`${updated.email} is now ${updated.status}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update account status.");
    } finally {
      setBusyUserId("");
    }
  }

  if (authLoading || !session) {
    return <main className="p-8 text-center text-sm text-slate-500">Checking your session...</main>;
  }

  if (!canManage) {
    return (
      <main className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-xl font-semibold">Access restricted</h1>
        <p className="mt-2 text-sm text-slate-600">Only organization owners and admins can manage settings.</p>
        <button type="button" className="hrm-button-secondary mt-4 inline-flex items-center gap-2" onClick={() => router.push("/dashboard")}>
          <ArrowLeft aria-hidden="true" size={16} />Back to dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">HRMPro workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Organization settings</h1>
          <p className="mt-2 text-sm text-slate-600">Manage organization details and account access.</p>
        </div>
        <button type="button" className="hrm-button-secondary inline-flex items-center gap-2" onClick={() => router.push("/dashboard")}>
          <ArrowLeft aria-hidden="true" size={16} />Back to dashboard
        </button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      {loading ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading settings...</p>
      ) : (
        <>
          <form onSubmit={handleSaveOrganization} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Organization profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Organization name
                <input required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
              </label>
              <div className="text-sm font-medium text-slate-700">
                Organization slug
                <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2.5 font-normal text-slate-600">{organization?.slug}</p>
              </div>
            </div>
            <button type="submit" disabled={savingName || !name.trim()} className="hrm-button-primary inline-flex items-center gap-2 disabled:opacity-50">
              <Save aria-hidden="true" size={16} />
              {savingName ? "Saving..." : "Save organization"}
            </button>
          </form>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Organization users</h2>
              <p className="mt-1 text-sm text-slate-500">Role changes are restricted; suspend or reactivate account access here.</p>
            </div>
            {users.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">No user accounts found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => {
                      const protectedUser =
                        user._id === userId ||
                        user.role === "owner" ||
                        (role === "admin" && user.role === "admin");
                      return (
                        <tr key={user._id}>
                          <td className="px-5 py-4 font-medium">{user.email}</td>
                          <td className="px-5 py-4 capitalize">{user.role}</td>
                          <td className="px-5 py-4 capitalize">{user.status}</td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              disabled={protectedUser || busyUserId === user._id}
                              onClick={() => void handleStatusChange(user)}
                              className={`inline-flex items-center gap-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${user.status === "active" ? "text-red-700 hover:text-red-800" : "text-emerald-700 hover:text-emerald-800"}`}
                            >
                              {user.status === "active" ? <Ban aria-hidden="true" size={16} /> : <CheckCircle2 aria-hidden="true" size={16} />}
                              {busyUserId === user._id
                                ? "Saving..."
                                : user.status === "active"
                                  ? "Suspend"
                                  : "Reactivate"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
