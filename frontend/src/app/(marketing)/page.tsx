import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  Plus,
  Users,
} from "lucide-react";

const features = [
  { icon: Users, title: "Employee Management", text: "Centralize employee profiles, departments, job history and organization details." },
  { icon: Clock3, title: "Attendance Tracking", text: "Track attendance, check-in and check-out records with ease." },
  { icon: CalendarDays, title: "Leave Management", text: "Submit leave requests, review applications and manage approvals." },
  { icon: BarChart3, title: "Reports & Analytics", text: "Understand workforce trends and make informed decisions." },
  { icon: LockKeyhole, title: "Role-Based Access", text: "Keep sensitive employee information protected with controlled access." },
  { icon: FileText, title: "Document Management", text: "Keep important employee records organized in one place." },
];


const faqs = [
  { q: "How do I get started with HRMPro?", a: "Create an account, sign in and start setting up your organization and employee records." },
  { q: "Is my data secure?", a: "HRMPro should be deployed with secure authentication, protected API routes and properly configured database access." },
  { q: "Can I manage leave requests?", a: "Yes. The leave management module supports leave requests and review workflows." },
  { q: "Can I track employee attendance?", a: "Yes. Use the attendance module to create and review employee attendance records." },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 text-sm text-white">HR</span>
            HRMPro
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <Link className="text-green-700" href="/">Home</Link>
            <Link className="transition hover:text-green-700" href="/features">Features</Link>
            <Link className="transition hover:text-green-700" href="/solutions">Solutions</Link>
            <Link className="transition hover:text-green-700" href="/about">About</Link>
            <Link className="transition hover:text-green-700" href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100 sm:inline-flex">Sign in</Link>
            <Link href="/register" className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800">Get Started</Link>
          </div>
        </nav>
      </header>

      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-white to-green-50" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">Modern HR for Modern Teams</span>
            <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Your People.<br />One <span className="text-green-700">Powerful</span> Platform.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">Manage employees, attendance, leave and more — all in one place. Simple, secure and built for growing businesses.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800">Get Started Free <ArrowRight aria-hidden="true" size={16} /></Link>
              <Link href="/features" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-green-600 hover:text-green-800"><LayoutDashboard aria-hidden="true" className="text-green-700" size={18} /> Explore Features</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><Check aria-hidden="true" className="text-green-700" size={14} />Easy to get started</span><span className="inline-flex items-center gap-1"><Check aria-hidden="true" className="text-green-700" size={14} />Connected workflows</span><span className="inline-flex items-center gap-1"><Check aria-hidden="true" className="text-green-700" size={14} />Built for growing teams</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-3xl bg-green-100/70 blur-2xl" />
            <Image
              src="/assets/hr-workspace.svg"
              alt="Illustration of a team working together around an organized HR workspace."
              width={560}
              height={360}
              priority
              className="mx-auto h-52 w-auto max-w-full object-contain sm:h-60"
            />
            <div className="relative -mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-green-900/10 sm:-mt-12">
              <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3"><span className="h-2.5 w-2.5 rounded-full bg-red-400"/><span className="h-2.5 w-2.5 rounded-full bg-amber-400"/><span className="h-2.5 w-2.5 rounded-full bg-green-500"/><span className="ml-3 text-xs font-bold">HRMPro Workspace</span></div>
              <div className="grid min-h-72 grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr]">
                <div className="space-y-3 bg-green-950 p-3 text-xs text-green-50"><p className="mb-5 font-bold">HRMPro</p><p className="flex items-center gap-2 rounded-md bg-green-800 px-2 py-2"><LayoutDashboard aria-hidden="true" size={14} />Dashboard</p><p className="flex items-center gap-2 px-2"><Users aria-hidden="true" size={14} />Employees</p><p className="flex items-center gap-2 px-2"><Clock3 aria-hidden="true" size={14} />Attendance</p><p className="flex items-center gap-2 px-2"><CalendarDays aria-hidden="true" size={14} />Leave</p><p className="flex items-center gap-2 px-2"><Users aria-hidden="true" size={14} />Departments</p><p className="flex items-center gap-2 px-2"><BarChart3 aria-hidden="true" size={14} />Reports</p></div>
                <div className="bg-slate-50 p-4 sm:p-5"><p className="text-sm font-bold">Workforce overview</p><p className="mt-1 text-xs text-slate-500">Your organization at a glance</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{[{n:"Employees",v:"Team overview"},{n:"Attendance",v:"Daily records"},{n:"Leave requests",v:"Review status"}].map(x=><div key={x.n} className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{x.n}</p><p className="mt-2 text-sm font-bold text-green-800">{x.v}</p></div>)}</div>
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold">People operations</p><div className="mt-4 flex h-20 items-end gap-2">{[35,52,42,68,56,78,65,90,72,96,80,100].map((h,i)=><div key={i} style={{height:`${h}%`}} className="flex-1 rounded-t bg-green-600/80"/>)}</div><p className="mt-2 text-center text-xs text-slate-400">Illustrative dashboard preview</p></div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-right text-xs text-slate-500">A clearer view of your people operations</p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/70 py-7">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8"><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Everything your people team needs in one place</p><div className="mt-5 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-bold text-slate-400"><span>Employee Records</span><span>Attendance</span><span>Leave Requests</span><span>Departments</span><span>Reports</span></div></div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-bold uppercase tracking-widest text-green-700">One connected workspace</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Everything you need to manage your people</h2><p className="mt-4 leading-7 text-slate-600">Spend less time switching tools and more time supporting your team.</p></div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{features.map(f=>{const Icon=f.icon;return <article key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg hover:shadow-green-900/5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-800"><Icon aria-hidden="true" size={22} strokeWidth={2} /></span><h3 className="mt-5 text-lg font-bold">{f.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{f.text}</p></article>})}</div>
      </section>

      <section className="bg-green-50 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div><span className="text-xs font-bold uppercase tracking-widest text-green-700">Employee management</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Complete employee information in one place</h2><p className="mt-4 leading-7 text-slate-600">Keep employee profiles and department information organized. Find the records you need and manage your workforce from a central workspace.</p><ul className="mt-6 space-y-3 text-sm text-slate-700"><li className="flex items-center gap-2"><Check aria-hidden="true" className="text-green-700" size={16} />Employee records and details</li><li className="flex items-center gap-2"><Check aria-hidden="true" className="text-green-700" size={16} />Department and organization management</li><li className="flex items-center gap-2"><Check aria-hidden="true" className="text-green-700" size={16} />Centralized workforce information</li></ul><Link href="/register" className="mt-7 inline-flex items-center font-bold text-green-800 hover:text-green-950">Get started <ArrowRight aria-hidden="true" className="ml-2" size={16} /></Link></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-green-900/5 sm:p-7"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="font-bold">Employee directory</p><p className="mt-1 text-xs text-slate-500">A simple view of your team</p></div><span className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-800">People</span></div>{["Employee profile","Department details","Attendance history","Leave records"].map((x,i)=><div key={x} className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">{i+1}</span><span className="text-sm font-medium">{x}</span><Check aria-hidden="true" className="ml-auto text-green-700" size={18} /></div>)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="order-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-green-900/5 lg:order-1"><p className="font-bold">Attendance & leave overview</p><p className="mt-1 text-xs text-slate-500">Keep daily workforce processes organized</p><div className="mt-6 grid grid-cols-7 gap-2">{Array.from({length:35},(_,i)=><div key={i} className={`flex aspect-square items-center justify-center rounded-md text-xs ${[3,5,8,12,13,18,22,25,29,31].includes(i)?"bg-green-600 text-white":"bg-slate-50 text-slate-500"}`}>{i+1<=31?i+1:""}</div>)}</div><div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-600"/>Recorded activity</span><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-200"/>Other dates</span></div></div>
        <div className="order-1 lg:order-2"><span className="text-xs font-bold uppercase tracking-widest text-green-700">Attendance & leave</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Simplify everyday people operations</h2><p className="mt-4 leading-7 text-slate-600">Keep attendance records and leave requests together. Give your team a clearer process for submitting, tracking and reviewing requests.</p><ul className="mt-6 space-y-3 text-sm text-slate-700"><li className="flex items-center gap-2"><Check aria-hidden="true" className="text-green-700" size={16} />Maintain attendance records</li><li className="flex items-center gap-2"><Check aria-hidden="true" className="text-green-700" size={16} />Submit and review leave requests</li><li className="flex items-center gap-2"><Check aria-hidden="true" className="text-green-700" size={16} />Keep workforce workflows organized</li></ul><Link href="/login" className="mt-7 inline-flex items-center font-bold text-green-800 hover:text-green-950">Explore your workspace <ArrowRight aria-hidden="true" className="ml-2" size={16} /></Link></div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:items-center lg:px-8"><div><span className="text-xs font-bold uppercase tracking-widest text-green-400">Built for growing teams</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">A better way to organize your workforce</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">Bring everyday employee administration into one workspace, with a foundation that can grow alongside your organization.</p><Link href="/register" className="mt-7 inline-flex items-center rounded-lg bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-500">Create your account <ArrowRight aria-hidden="true" className="ml-2" size={16} /></Link></div><div className="grid grid-cols-2 gap-4">{[{n:"01",t:"Set up your workspace"},{n:"02",t:"Organize employee records"},{n:"03",t:"Manage attendance"},{n:"04",t:"Review leave requests"}].map(x=><div key={x.n} className="rounded-xl border border-white/10 bg-white/5 p-5"><p className="text-sm font-bold text-green-400">{x.n}</p><p className="mt-3 font-semibold">{x.t}</p></div>)}</div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="text-center"><span className="text-xs font-bold uppercase tracking-widest text-green-700">Common questions</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Frequently asked questions</h2></div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-3 md:grid-cols-2">{faqs.map(f=><details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.q}<span className="text-green-700 transition group-open:rotate-45"><Plus aria-hidden="true" size={18} /></span></summary><p className="mt-3 text-sm leading-6 text-slate-600">{f.a}</p></details>)}</div>
      </section>

      <section className="px-5 pb-16"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-2xl bg-green-100 p-7 sm:flex-row sm:items-center sm:p-10"><div><p className="text-xs font-bold uppercase tracking-widest text-green-800">Ready to get started?</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">Make people management simpler</h2><p className="mt-2 text-sm text-slate-600">Bring your employee workflows together with HRMPro.</p></div><div className="flex flex-wrap gap-3"><Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800">Get Started Free <ArrowRight aria-hidden="true" size={16} /></Link><Link href="/contact" className="rounded-lg border border-green-800/20 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-green-50">Contact Us</Link></div></div></section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div><Link href="/" className="flex items-center gap-2 text-lg font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-green-700 text-xs text-white">HR</span>HRMPro</Link><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">A centralized workspace for employee records, attendance and leave management.</p></div>
          <div><h3 className="font-bold">Product</h3><div className="mt-4 space-y-3 text-sm text-slate-500"><p><Link href="/features" className="hover:text-green-700">Features</Link></p><p><a href="#pricing" className="hover:text-green-700">Pricing</a></p><p><Link href="/solutions" className="hover:text-green-700">Solutions</Link></p></div></div>
          <div><h3 className="font-bold">Company</h3><div className="mt-4 space-y-3 text-sm text-slate-500"><p><Link href="/about" className="hover:text-green-700">About us</Link></p><p><Link href="/contact" className="hover:text-green-700">Contact</Link></p></div></div>
          <div><h3 className="font-bold">Your account</h3><div className="mt-4 space-y-3 text-sm text-slate-500"><p><Link href="/login" className="hover:text-green-700">Sign in</Link></p><p><Link href="/register" className="hover:text-green-700">Create account</Link></p></div></div>
        </div>
        <div className="border-t border-slate-100"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} HRMPro. All rights reserved.</span><span>People operations, organized.</span></div></div>
      </footer>
    </main>
  );
}
