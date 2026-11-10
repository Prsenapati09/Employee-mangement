import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const features = [
  { number: "01", title: "Employee Management", description: "Manage employee profiles and keep workforce information organized in one place.", items: ["Employee records", "Employee details and status", "Centralized employee directory"], image: { src: "/assets/feature-employees.svg", alt: "Illustration of an organized employee profile and directory." } },
  { number: "02", title: "Department Management", description: "Organize your company into departments and maintain team information.", items: ["Create departments", "Update department details", "Keep organizational information organized"] },
  { number: "03", title: "Attendance Tracking", description: "Maintain attendance records and review employee attendance activity.", items: ["Record attendance", "Track check-in and check-out times", "Review attendance records"], image: { src: "/assets/feature-attendance.svg", alt: "Illustration of a calendar and clock for attendance tracking." } },
  { number: "04", title: "Leave Management", description: "Create and review employee leave requests through a centralized workflow.", items: ["Submit leave requests", "Review and update request status", "Track leave request history"], image: { src: "/assets/feature-leave.svg", alt: "Illustration of a leave request with a calendar symbol." } },
  { number: "05", title: "Document Management", description: "Keep important employee records organized in one place.", items: ["Store employee documents", "Organize files by category", "Download or remove documents"], image: { src: "/assets/feature-documents.svg", alt: "Illustration of an organized employee document marked complete." } },
  { number: "06", title: "Reports & Analytics", description: "Review organization, attendance and leave activity in clear reports.", items: ["Workforce summaries", "Attendance trends", "Leave request breakdowns"], image: { src: "/assets/feature-reports.svg", alt: "Illustration of a workforce analytics chart." } },
  { number: "07", title: "Secure Account Access", description: "Access the HRMPro workspace through the existing authentication flow.", items: ["Sign in and sign out", "Protected application pages", "Session-based access"] },
  { number: "08", title: "Connected Workspace", description: "Access the main employee management modules from a single application.", items: ["Central dashboard", "Module navigation", "Consistent workspace experience"] },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-gradient-to-br from-green-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-950"><ArrowLeft aria-hidden="true" size={16} />Back to Home</Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-green-700">HRMPro features</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">The essential tools to manage your people</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Bring employee records, departments, attendance and leave management together in one organized workspace.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800">Get Started <ArrowRight aria-hidden="true" size={16} /></Link>
            <Link href="/login" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.number} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg">
              {feature.image && (
                <div className="mb-5 flex h-28 items-center justify-center rounded-xl bg-green-50/80">
                  <Image
                    src={feature.image.src}
                    alt={feature.image.alt}
                    width={240}
                    height={160}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
              )}
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-sm font-extrabold text-green-800">{feature.number}</span>
              <h2 className="mt-5 text-xl font-bold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {feature.items.map((item) => <li key={item} className="flex items-center gap-2"><Check aria-hidden="true" className="shrink-0 text-green-700" size={16} />{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-green-50 px-5 py-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-2xl border border-green-100 bg-white p-7 sm:flex-row sm:items-center sm:p-10">
          <div><h2 className="text-2xl font-extrabold tracking-tight">Ready to organize your HR workflows?</h2><p className="mt-3 text-sm leading-6 text-slate-600">Sign in to your workspace or create an account to get started.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/register" className="rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800">Create Account</Link><Link href="/login" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold hover:bg-slate-50">Sign In</Link></div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><Link href="/" className="font-extrabold text-slate-900">HRMPro</Link><div className="flex flex-wrap gap-5"><Link href="/solutions" className="hover:text-green-700">Solutions</Link><Link href="/about" className="hover:text-green-700">About</Link><Link href="/contact" className="hover:text-green-700">Contact</Link><Link href="/login" className="hover:text-green-700">Sign in</Link></div><span>© {new Date().getFullYear()} HRMPro</span></div>
      </footer>
    </main>
  );
}
