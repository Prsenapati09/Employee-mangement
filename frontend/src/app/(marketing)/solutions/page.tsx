import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const solutions = [
  { number: "01", title: "For HR Administrators", description: "Keep employee information, department records and leave requests organized from one workspace.", points: ["Maintain employee records", "Organize departments", "Review leave requests"] },
  { number: "02", title: "For Team Managers", description: "Make everyday team administration easier with accessible employee and attendance records.", points: ["Review attendance activity", "Keep team information organized", "Follow leave request status"] },
  { number: "03", title: "For Growing Organizations", description: "Bring common people-management workflows into one application as your team evolves.", points: ["Centralized employee information", "Connected HR workflows", "One place to access key modules"] },
];

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-gradient-to-br from-green-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-950"><ArrowLeft aria-hidden="true" size={16} />Back to Home</Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-widest text-green-700">HRMPro solutions</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">People management for everyday work</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Give your team a clearer way to organize employee information, departments, attendance and leave workflows.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800">Get Started <ArrowRight aria-hidden="true" size={16} /></Link>
              <Link href="/features" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold hover:bg-slate-50">Explore Features</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-green-100 bg-white/80 p-3 shadow-xl shadow-green-900/5 sm:p-5">
            <Image
              src="/assets/team-workflows.svg"
              alt="Illustration showing connected team workflows around a shared organization dashboard."
              width={480}
              height={320}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {solutions.map((solution) => (
            <article key={solution.number} className="rounded-2xl border border-slate-200 p-7 transition hover:border-green-200 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-sm font-extrabold text-green-800">{solution.number}</span>
              <h2 className="mt-5 text-xl font-bold">{solution.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{solution.description}</p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">{solution.points.map((point) => <li key={point} className="flex items-center gap-2"><Check aria-hidden="true" className="shrink-0 text-green-700" size={16} />{point}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-green-50 px-5 py-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-2xl bg-white p-7 sm:flex-row sm:items-center sm:p-10">
          <div><h2 className="text-2xl font-extrabold tracking-tight">Bring your people workflows together</h2><p className="mt-3 text-sm leading-6 text-slate-600">Start with the employee management tools available in HRMPro today.</p></div>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800">Create Account <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><Link href="/" className="font-extrabold text-slate-900">HRMPro</Link><div className="flex flex-wrap gap-5"><Link href="/features" className="hover:text-green-700">Features</Link><Link href="/about" className="hover:text-green-700">About</Link><Link href="/contact" className="hover:text-green-700">Contact</Link><Link href="/login" className="hover:text-green-700">Sign in</Link></div><span>© {new Date().getFullYear()} HRMPro</span></div>
      </footer>
    </main>
  );
}
