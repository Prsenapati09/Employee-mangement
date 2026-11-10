"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import EmployeeManagement from "@/components/employees/employee-management";

const employeeManagementRoles = ["owner", "admin", "hr"];

export default function EmployeesPage() {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const canManageEmployees = employeeManagementRoles.includes(
    session?.profile.user.role ?? "",
  );

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/login");
    } else if (!canManageEmployees) {
      router.replace("/dashboard");
    }
  }, [canManageEmployees, isLoading, router, session]);

  if (isLoading || !session || !canManageEmployees) {
    return (
      <main
        aria-busy="true"
        className="flex min-h-[50vh] items-center justify-center bg-slate-50"
      >
        <p className="text-sm text-slate-600">Checking employee access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto max-w-[1600px]">
        <EmployeeManagement />
      </div>
    </main>
  );
}
