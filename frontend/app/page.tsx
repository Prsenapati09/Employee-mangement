"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ArrowRight, BarChart3, Box, Building2, CalendarCheck, Check, Clock3, FileText, Hash,
  LayoutDashboard, LayoutGrid, MapPin, Minus, Play, Plus, Settings, ShieldCheck,
  ShoppingBag, User, UserCog, UserPlus, Users,
} from "lucide-react";

/* ───────── Mockups ───────── */
const sideItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Users, label: "Employees" },
  { icon: Clock3, label: "Attendance" },
  { icon: CalendarCheck, label: "Leave" },
  { icon: BarChart3, label: "Reports" },
  { icon: FileText, label: "Documents" },
  { icon: Settings, label: "Settings" },
];

function Frame({ children, active = 0, sidebar = true }: { children: ReactNode; active?: number; sidebar?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-green-900/10">
      <div className="flex items-center gap-1.5 border-b border-gray-100 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-yellow-400" />
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="ml-3 text-[9px] font-bold text-[#143d1f]">HRMPro</span>
        <span className="ml-auto h-4 w-24 rounded bg-gray-100" />
      </div>
      <div className="flex">
        {sidebar && (
          <aside className="hidden w-[22%] min-w-[78px] bg-[#1e4d2b] p-2 sm:block">
            {sideItems.map((s, i) => (
              <div
                key={s.label}
                className={`mb-1 flex items-center gap-1.5 rounded px-1.5 py-1.5 text-[8px] text-white/80 ${
                  i === active ? "bg-white/15 font-semibold text-white" : ""
                }`}
              >
                <s.icon size={9} /> {s.label}
              </div>
            ))}
          </aside>
        )}
        <div className="min-w-0 flex-1 p-3">{children}</div>
      </div>
    </div>
  );
}

function Donut({ size = 56, segments }: { size?: number; segments: [string, number][] }) {
  let acc = 0;
  const stops = segments
    .map(([c, v]) => {
      const s = `${c} ${acc}% ${acc + v}%`;
      acc += v;
      return s;
    })
    .join(", ");
  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(${stops})` }}
    >
      <div className="absolute inset-[22%] rounded-full bg-white" />
    </div>
  );
}

function DashboardMockup() {
  const stats = [
    ["248", "Employees"],
    ["12", "On Leave"],
    ["8", "Pending"],
    ["5", "Departments"],
  ];
  return (
    <Frame>
      <p className="mb-2 text-[10px] font-bold text-gray-900">Dashboard</p>
      <div className="grid grid-cols-4 gap-1.5">
        {stats.map(([n, l]) => (
          <div key={l} className="rounded-md border border-gray-100 p-1.5">
            <p className="text-sm font-extrabold text-gray-900">{n}</p>
            <p className="text-[7px] text-gray-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        <div className="col-span-3 rounded-md border border-gray-100 p-2">
          <p className="text-[8px] font-semibold text-gray-700">Attendance Overview</p>
          <svg viewBox="0 0 200 70" className="mt-1 h-16 w-full">
            <defs>
              <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#2e8b2e" stopOpacity=".25" />
                <stop offset="1" stopColor="#2e8b2e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 55 L35 48 L70 40 L105 42 L140 28 L175 20 L200 12 L200 70 L0 70Z" fill="url(#g1)" />
            <path d="M0 55 L35 48 L70 40 L105 42 L140 28 L175 20 L200 12" fill="none" stroke="#2e8b2e" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="col-span-2 rounded-md border border-gray-100 p-2">
          <p className="text-[8px] font-semibold text-gray-700">Employees by Department</p>
          <div className="mt-1 flex items-center gap-2">
            <Donut size={44} segments={[["#2e8b2e", 45], ["#86efac", 25], ["#14532d", 18], ["#d9f99d", 12]]} />
            <div className="space-y-0.5 text-[6px] text-gray-500">
              <p>Engineering 45%</p>
              <p>Design 25%</p>
              <p>HR 18%</p>
              <p>Others 12%</p>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DirectoryMockup() {
  const rows = ["Sarah Johnson", "Michael Tan", "Priya Sharma", "David Kim", "Emily Carter"];
  return (
    <div className="relative pb-6 pr-0 sm:pr-16">
      <Frame active={1}>
        <p className="mb-2 text-[10px] font-bold text-gray-900">Employee Directory</p>
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r} className="flex items-center gap-2 rounded border border-gray-100 p-1.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#dcf5cf] text-[#2e8b2e]">
                <User size={10} />
              </span>
              <span className="text-[8px] font-medium text-gray-700">{r}</span>
              <span className="ml-auto h-1.5 w-10 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </Frame>
      <div className="absolute -bottom-2 right-0 w-44 rounded-xl border border-gray-100 bg-white p-3 shadow-xl sm:w-48">
        <div className="flex items-center gap-2">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#bfe8b0] to-[#2e8b2e] text-white">
            <User size={22} />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">Sarah Johnson</p>
            <p className="text-[10px] text-gray-500">Product Designer</p>
          </div>
        </div>
        <dl className="mt-3 space-y-1 text-[9px]">
          {[
            ["Department", "Design"],
            ["Manager", "David Kim"],
            ["Joining Date", "Jan 15, 2023"],
            ["Status", "Active"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-gray-400">{k}</dt>
              <dd className={`font-medium ${v === "Active" ? "text-[#2e8b2e]" : "text-gray-700"}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function AttendanceMockup() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const green = [2, 3, 4, 8, 9, 10, 11, 16, 17, 18, 22, 23, 24, 25];
  const orange = [12, 19];
  return (
    <Frame active={2}>
      <div className="grid gap-3 sm:grid-cols-5">
        <div className="sm:col-span-3">
          <p className="text-[10px] font-bold text-gray-900">Attendance</p>
          <p className="mt-1 text-center text-[8px] font-semibold text-gray-600">April 2026</p>
          <div className="mt-1 grid grid-cols-7 gap-y-1.5 text-center text-[7px] text-gray-500">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d} className="font-semibold">{d}</span>
            ))}
            {days.map((d) => (
              <span key={d} className="flex flex-col items-center">
                {d}
                <i
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    green.includes(d) ? "bg-green-500" : orange.includes(d) ? "bg-orange-400" : "bg-transparent"
                  }`}
                />
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="rounded-md border border-gray-100 p-2">
            <p className="text-[7px] text-gray-500">Today</p>
            <p className="text-sm font-extrabold text-gray-900">09:00 AM</p>
            <div className="mt-1 rounded bg-[#2e8b2e] py-1 text-center text-[8px] font-semibold text-white">Check Out</div>
          </div>
          <div className="rounded-md border border-gray-100 p-2">
            <p className="text-[8px] font-semibold text-gray-700">Leave Requests</p>
            {[["Annual Leave", "Pending", "text-orange-500"], ["Sick Leave", "Approved", "text-green-600"]].map(([a, b, c]) => (
              <div key={a} className="mt-1 flex justify-between text-[7px]">
                <span className="text-gray-600">{a}</span>
                <span className={`font-semibold ${c}`}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ReportsMockup() {
  const bars = [
    ["Eng", 80, "#2e8b2e"],
    ["Design", 48, "#9bd88a"],
    ["HR", 28, "#2e8b2e"],
    ["Sales", 36, "#2e8b2e"],
    ["Mktg", 14, "#9ca3af"],
  ] as const;
  return (
    <Frame sidebar={false}>
      <p className="mb-2 text-[10px] font-bold text-gray-900">Reports & Analytics</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-gray-100 p-2">
          <p className="text-[8px] font-semibold text-gray-700">Headcount by Department</p>
          <div className="mt-2 flex h-24 items-end justify-around">
            {bars.map(([l, h, c]) => (
              <div key={l} className="flex flex-col items-center gap-1">
                <span className="w-4 rounded-sm" style={{ height: h, background: c }} />
                <span className="text-[6px] text-gray-500">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-gray-100 p-2">
          <p className="text-[8px] font-semibold text-gray-700">Leave Distribution</p>
          <div className="mt-2 flex items-center gap-3">
            <Donut size={70} segments={[["#2e8b2e", 45], ["#86efac", 25], ["#14532d", 18], ["#d1d5db", 12]]} />
            <div className="space-y-0.5 text-[7px] text-gray-500">
              <p>Annual 45%</p>
              <p>Sick 25%</p>
              <p>Personal 18%</p>
              <p>Unpaid 12%</p>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ───────── Hero ───────── */
const trusted = [
  { name: "Google", icon: null },
  { name: "Microsoft", icon: LayoutGrid },
  { name: "Slack", icon: Hash },
  { name: "airbnb", icon: MapPin },
  { name: "shopify", icon: ShoppingBag },
  { name: "Dropbox", icon: Box },
];

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#e4f6d8] blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-14">
        <div>
          <span className="inline-block rounded-md border border-[#cfeec0] bg-[#f1fae9] px-2.5 py-1 text-[10px] font-semibold text-[#2e8b2e]">
            Modern HR for Modern Teams
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl">
            Your People.
            <br />
            One <span className="text-[#2eae1e]">Powerful</span> Platform.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
            Manage employees, attendance, leave, and more — all in one place. Simple, secure, and built for growing
            businesses.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-[#2e8b2e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256f25]"
            >
              Get Started Free <ArrowRight size={15} />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full border border-[#2e8b2e] text-[#2e8b2e]">
                <Play size={9} fill="currentColor" />
              </span>
              Watch Demo
            </Link>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
            {["No credit card required", "Quick setup", "Trusted by businesses"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check size={14} className="text-[#2e8b2e]" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <DashboardMockup />
          <p className="mt-2 text-right text-[11px] italic text-[#2e8b2e]">Everything you need to manage your team</p>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-gray-500">Trusted by growing businesses</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-400">
          {trusted.map(({ name, icon: Icon }) => (
            <span key={name} className="flex items-center gap-1.5 text-lg font-semibold">
              {Icon && <Icon size={16} />} {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Features strip ───────── */
const features = [
  { icon: Users, title: "Employee Management", desc: "Centralize all employee information." },
  { icon: Clock3, title: "Attendance Tracking", desc: "Track time and attendance effortlessly." },
  { icon: CalendarCheck, title: "Leave Management", desc: "Flexible leave policies and approvals." },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Real-time insights for better decisions." },
  { icon: ShieldCheck, title: "Role-Based Access", desc: "Control access with fine-grained permissions." },
  { icon: FileText, title: "Document Management", desc: "Store and manage important documents." },
];

function Features() {
  return (
    <section id="features" className="bg-[#f4fbee]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-6 lg:px-8">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#dcf5cf] text-[#2e8b2e]">
              <Icon size={22} />
            </span>
            <h3 className="mt-3 text-xs font-bold text-gray-900">{title}</h3>
            <p className="mx-auto mt-1 max-w-[150px] text-[11px] leading-snug text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────── Feature rows ───────── */
type RowProps = {
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  mockup: ReactNode;
  reverse?: boolean;
  tinted?: boolean;
};

function Row({ eyebrow, title, desc, bullets, mockup, reverse, tinted }: RowProps) {
  return (
    <div className={tinted ? "bg-[#f4fbee]" : "bg-white"}>
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className={reverse ? "lg:order-2" : ""}>{mockup}</div>
        <div className={reverse ? "lg:order-1" : ""}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">{eyebrow}</span>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-gray-900 sm:text-[26px]">{title}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">{desc}</p>
          <ul className="mt-4 space-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#2e8b2e] text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Link href="#" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2e8b2e] hover:underline">
            Learn more <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureRows() {
  return (
    <section id="solutions">
      <Row
        eyebrow="Employee Management"
        title="Complete Employee Information in One Place"
        desc="Store and manage employee details, documents, job history, departments, and reporting structure. Keep your organization structured and up to date."
        bullets={["Detailed employee profiles", "Department and designation management", "Onboarding and offboarding workflows"]}
        mockup={<DirectoryMockup />}
      />
      <Row
        eyebrow="Attendance & Leave"
        title="Simplify Attendance and Leave Management"
        desc="Track check-ins, working hours, and leave requests. Automate approvals and maintain accurate records with minimal effort."
        bullets={["Check-in and check-out", "Leave requests and approvals", "Attendance correction workflow"]}
        mockup={<AttendanceMockup />}
        reverse
      />
      <Row
        eyebrow="Reports & Analytics"
        title="Make Data-Driven Decisions"
        desc="Get meaningful insights with powerful reports and analytics. Understand your workforce, track attendance trends, and monitor leave patterns."
        bullets={["Headcount and department reports", "Attendance and leave analytics", "Export and share reports"]}
        mockup={<ReportsMockup />}
      />
    </section>
  );
}

/* ───────── Roles ───────── */
const roles = [
  { icon: UserCog, title: "HR Administrators", desc: "Manage employees, policies, and organization settings." },
  { icon: Users, title: "Managers", desc: "Approve leave, monitor team attendance, and manage team performance." },
  { icon: User, title: "Employees", desc: "View profile, check attendance, apply for leave, and access documents." },
  { icon: Building2, title: "Company Admins", desc: "Manage organization, users, roles, and security settings." },
];

function Roles() {
  return (
    <section className="bg-[#f1fae9]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">Built for every role</span>
          <h2 className="mt-1 text-xl font-extrabold text-gray-900">A Better Experience for Everyone</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-lg border border-[#dcefd0] bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#dcf5cf] text-[#2e8b2e]">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="text-xs font-bold text-gray-900">{title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Security + Steps ───────── */
const security = [
  "Role-based access control",
  "Secure authentication",
  "Audit logs and data tracking",
  "Organization-level data isolation",
];

const steps = [
  { icon: Building2, title: "Create Your Organization", desc: "Set up your company in minutes." },
  { icon: UserPlus, title: "Invite Your Team", desc: "Add employees and configure roles." },
  { icon: BarChart3, title: "Manage with Ease", desc: "Start using all HR features from one dashboard." },
];

function SecuritySteps() {
  return (
    <section id="about" className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex items-start gap-5">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#2e8b2e] text-white">
            <ShieldCheck size={40} />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">Security & Privacy</span>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900">Your Data is Safe with Us</h2>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-gray-500">
              We use industry best practices to keep your data secure, private, and accessible only to authorized users.
            </p>
            <ul className="mt-3 space-y-1.5">
              {security.map((s) => (
                <li key={s} className="flex items-center gap-2 text-xs text-gray-700">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full border border-[#2e8b2e] text-[#2e8b2e]">
                    <Check size={9} strokeWidth={3} />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:border-l lg:border-gray-100 lg:pl-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">How it works</span>
          <h2 className="mt-1 text-lg font-extrabold text-gray-900">Get Started in 3 Simple Steps</h2>
          <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:text-center">
                <div className="relative">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f1fae9] text-[#2e8b2e]">
                    <Icon size={24} />
                  </span>
                  <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#2e8b2e] text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{title}</h3>
                  <p className="mt-1 max-w-[150px] text-[11px] leading-snug text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Pricing ───────── */
const plans = [
  {
    name: "Starter",
    price: 29,
    sub: "Up to 50 employees",
    features: ["Employee management", "Attendance tracking", "Leave management", "Basic reports"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: 59,
    sub: "Up to 200 employees",
    features: ["All Starter features", "Advanced reports", "Organization management", "Role-based access", "Priority support"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 99,
    sub: "Unlimited employees",
    features: ["All Professional features", "Custom integrations", "Advanced security", "Dedicated account manager", "24/7 support"],
    cta: "Contact Sales",
    popular: false,
  },
];

function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const tabs = [
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ] as const;

  return (
    <section id="pricing" className="bg-[#f1fae9]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">Pricing</span>
          <h2 className="mt-1 text-2xl font-extrabold text-[#143d1f]">Simple and Transparent Pricing</h2>
          <p className="mt-1 text-xs text-gray-500">Choose the plan that fits your business. All plans include core HR features.</p>

          <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-[#cfeec0] bg-white p-1 text-xs">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setBilling(t.key)}
                className={`rounded-full px-4 py-1 font-semibold transition ${
                  billing === t.key ? "bg-[#2e8b2e] text-white" : "text-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="rounded-full bg-[#dcf5cf] px-3 py-1 font-semibold text-[#2e8b2e]">Save 20%</span>
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-3">
          {plans.map((p) => {
            const price = billing === "monthly" ? p.price : Math.round(p.price * 0.8);
            return (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-xl bg-white p-5 ${
                  p.popular ? "border-2 border-[#2e8b2e] shadow-lg md:-my-2" : "border border-gray-200"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-[#2e8b2e] px-3 py-0.5 text-[10px] font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-extrabold text-gray-900">${price}</span>
                  <span className="text-xs text-gray-500"> /month</span>
                </p>
                <p className="mt-1 text-[11px] text-gray-500">{p.sub}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                      <Check size={13} className="text-[#2e8b2e]" strokeWidth={3} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.cta === "Contact Sales" ? "#contact" : "/signup"}
                  className={`mt-5 rounded-md py-2 text-center text-xs font-semibold transition ${
                    p.popular
                      ? "bg-[#2e8b2e] text-white hover:bg-[#256f25]"
                      : "border border-gray-200 text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────── Testimonials ───────── */
const items = [
  {
    quote: "HRMPro has simplified our HR operations and saved us hours of manual work every week.",
    name: "Emily Carter",
    role: "Operations Manager, TechCorp",
  },
  {
    quote: "The attendance and leave management features are easy to use and very reliable.",
    name: "Michael Tan",
    role: "CEO, GrowthLabs",
  },
  {
    quote: "A clean, modern solution that our entire team loves. Highly recommended!",
    name: "Priya Sharma",
    role: "HR Head, InnovateX",
  },
];

function Testimonials() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">What our customers say</span>
        <h2 className="mt-1 text-lg font-extrabold text-gray-900">Trusted by Teams Like Yours</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="rounded-lg border border-gray-200 bg-white p-4">
              <blockquote className="text-xs leading-relaxed text-gray-700">“{t.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dcf5cf] text-[#2e8b2e]">
                  <User size={16} />
                </span>
                <span>
                  <span className="block text-xs font-bold text-gray-900">{t.name}</span>
                  <span className="block text-[10px] text-gray-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
const faqs = [
  { q: "How do I get started with HRMPro?", a: "Create your organization, invite your team, and start managing everything from one dashboard in minutes." },
  { q: "Is my data secure?", a: "Yes. We use role-based access, secure authentication, audit logs, and organization-level data isolation." },
  { q: "Can I customize leave policies?", a: "Absolutely. Configure leave types, balances, and approval flows to match your company policy." },
  { q: "Do you offer support?", a: "Yes. All plans include support, and Enterprise includes a dedicated account manager and 24/7 help." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">FAQ</span>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <Link href="#" className="inline-flex items-center gap-1 text-xs font-semibold text-[#2e8b2e] hover:underline">
            View all FAQs <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
          {faqs.map((f, i) => (
            <div key={f.q} className="rounded-md border border-gray-200">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium text-gray-800"
                aria-expanded={open === i}
              >
                {f.q}
                {open === i ? <Minus size={14} /> : <Plus size={14} />}
              </button>
              {open === i && <p className="px-4 pb-3 text-xs leading-relaxed text-gray-500">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA ───────── */
function Cta() {
  return (
    <section className="bg-white px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-2xl bg-[#e4f6d8] px-6 py-6 md:flex-row md:items-center md:px-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">Ready to get started?</span>
          <h2 className="mt-1 text-xl font-extrabold text-[#143d1f]">Make People Management Simpler Today</h2>
          <p className="mt-1 text-xs text-gray-600">
            Join growing businesses and experience a better way to manage your team.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-[#2e8b2e] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#256f25]"
          >
            Get Started Free <ArrowRight size={14} />
          </Link>
          <Link
            href="#contact"
            className="rounded-md border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────── Page ───────── */
export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <Features />
        <FeatureRows />
        <Roles />
        <SecuritySteps />
        <Pricing />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
    </>
  );
}