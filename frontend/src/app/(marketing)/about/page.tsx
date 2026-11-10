import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const principles = [
  { number: "01", title: "Keep work organized", description: "Bring employee records, departments, attendance and leave requests into one workspace." },
  { number: "02", title: "Make everyday tasks clearer", description: "Give teams a straightforward way to access common people-management workflows." },
  { number: "03", title: "Build on a connected foundation", description: "Use a consistent application experience across the HRMPro modules currently available." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-gradient-to-br from-green-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-950"><ArrowLeft aria-hidden="true" size={16} />Back to Home</Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-green-700">About HRMPro</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">A simpler workspace for people management</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">HRMPro brings essential employee administration workflows together so teams can spend less time switching between records and more time supporting their people.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/features" className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800">Explore Features <ArrowRight aria-hidden="true" size={16} /></Link>
            <Link href="/contact" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold hover:bg-slate-50">Contact Us</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-green-700">Our purpose</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Make everyday HR workflows easier to manage</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">Managing people involves many connected tasks. HRMPro provides a central place to organize employee details, maintain department information, record attendance and manage leave requests.</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">The goal is a clear, consistent workspace that helps administrators and teams work with organized information.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <Image
            src="/assets/organized-workplace.svg"
            alt="Illustration of connected teams organizing employee information and workflows."
            width={440}
            height={320}
            className="mx-auto mb-5 h-40 w-full max-w-sm object-contain sm:h-44"
          />
          <h3 className="text-lg font-bold">What HRMPro brings together</h3>
          <ul className="mt-5 space-y-4 text-sm text-slate-700">
            {["Employee records and profiles", "Department information", "Attendance records", "Leave requests and review workflows", "A connected application dashboard"].map((item) => <li key={item} className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800"><Check aria-hidden="true" size={14} /></span><span>{item}</span></li>)}
          </ul>
        </div>
      </section>

      <section className="bg-green-50 px-5 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-widest text-green-700">Our approach</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Designed around practical team needs</h2><p className="mt-4 text-sm leading-7 text-slate-600">A straightforward experience for the everyday work involved in organizing employee information.</p></div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {principles.map((principle) => <article key={principle.number} className="rounded-2xl border border-green-100 bg-white p-6"><span className="text-sm font-extrabold text-green-700">{principle.number}</span><h3 className="mt-4 text-lg font-bold">{principle.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{principle.description}</p></article>)}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><Link href="/" className="font-extrabold text-slate-900">HRMPro</Link><div className="flex flex-wrap gap-5"><Link href="/features" className="hover:text-green-700">Features</Link><Link href="/solutions" className="hover:text-green-700">Solutions</Link><Link href="/contact" className="hover:text-green-700">Contact</Link><Link href="/login" className="hover:text-green-700">Sign in</Link></div><span>© {new Date().getFullYear()} HRMPro</span></div>
      </footer>
    </main>
  );
}
