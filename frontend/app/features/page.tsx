import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  LayoutDashboard,
  Network,
  Play,
  Settings,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";

/* Shared wrapper: matches the wider layout used on big screens */
const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[1600px] xl:px-12";

/* ───────── Mockup helpers ───────── */
const sideItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Users, label: "Employees" },
  { icon: Clock3, label: "Attendance" },
  { icon: CalendarCheck, label: "Leave" },
  { icon: BarChart3, label: "Reports" },
  { icon: FileText, label: "Documents" },
  { icon: Settings, label: "Settings" },
];

function Frame({ children, active = 0 }: { children: ReactNode; active?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-green-900/10">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-2">
        <div className="flex items-center gap-2">
          <span className="grid h-4 w-4 place-items-center rounded bg-[#2e8b2e] text-[6px] font-extrabold text-white">
            HR
          </span>
          <span className="text-[9px] font-bold text-[#143d1f]">HRMPro</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden h-4 w-28 rounded bg-gray-100 sm:block" />
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[#dcf5cf] text-[#2e8b2e]">
            <User size={8} />
          </span>
          <span className="hidden text-[7px] leading-tight text-gray-600 sm:block">
            John Doe
            <br />
            <span className="text-gray-400">HR Admin</span>
          </span>
        </div>
      </div>
      <div className="flex">
        <aside className="hidden w-[20%] min-w-[84px] bg-[#1e4d2b] p-2 sm:block">
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
      <div className="absolute inset-[24%] rounded-full bg-white" />
    </div>
  );
}

function Legend({ items }: { items: [string, string, string][] }) {
  return (
    <div className="space-y-1">
      {items.map(([color, label, pct]) => (
        <div key={label} className="flex items-center gap-1.5 text-[7px] text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          <span className="flex-1">{label}</span>
          <span className="font-semibold text-gray-700">{pct}</span>
        </div>
      ))}
    </div>
  );
}

function Tabs({ tabs, active = 0 }: { tabs: string[]; active?: number }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-b border-gray-100 text-[8px] text-gray-500">
      {tabs.map((t, i) => (
        <span
          key={t}
          className={`pb-1.5 ${i === active ? "border-b-2 border-[#2e8b2e] font-semibold text-[#2e8b2e]" : ""}`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ───────── Hero mockup ───────── */
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
          <div key={l} className="rounded-md border border-gray-100 p-2">
            <p className="text-base font-extrabold text-gray-900">{n}</p>
            <p className="text-[7px] text-gray-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        <div className="col-span-3 rounded-md border border-gray-100 p-2">
          <p className="text-[8px] font-semibold text-gray-700">Attendance Trend</p>
          <svg viewBox="0 0 200 70" className="mt-1 h-20 w-full">
            <defs>
              <linearGradient id="trend" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#2e8b2e" stopOpacity=".25" />
                <stop offset="1" stopColor="#2e8b2e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 58 L40 52 L80 42 L120 46 L160 30 L200 18 L200 70 L0 70Z" fill="url(#trend)" />
            <path d="M0 58 L40 52 L80 42 L120 46 L160 30 L200 18" fill="none" stroke="#2e8b2e" strokeWidth="1.5" />
          </svg>
          <div className="flex justify-between text-[6px] text-gray-400">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
        <div className="col-span-2 rounded-md border border-gray-100 p-2">
          <p className="text-[8px] font-semibold text-gray-700">Employee by Department</p>
          <div className="mt-2 flex items-center gap-2">
            <Donut size={52} segments={[["#2e8b2e", 40], ["#86efac", 20], ["#14532d", 15], ["#bbf7d0", 15], ["#d1d5db", 10]]} />
            <div className="flex-1">
              <Legend
                items={[
                  ["#2e8b2e", "Engineering", "40%"],
                  ["#86efac", "Design", "20%"],
                  ["#14532d", "Sales", "15%"],
                  ["#bbf7d0", "HR", "15%"],
                  ["#d1d5db", "Others", "10%"],
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ───────── Employee details mockup ───────── */
function EmployeeMockup() {
  const fields = [
    ["Employee Code", "EMP-001"],
    ["Email", "sarah.johnson@company.com"],
    ["Phone", "+1 (555) 123-4567"],
    ["Department", "Design"],
    ["Manager", "Michael Tan"],
    ["Joining Date", "Jan 15, 2023"],
  ];
  return (
    <Frame active={1}>
      <p className="text-[10px] font-bold text-gray-900">Employee Details</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#bfe8b0] to-[#2e8b2e] text-white">
          <User size={22} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Sarah Johnson</p>
          <p className="text-[8px] text-gray-500">Product Designer</p>
          <p className="text-[8px] font-semibold text-[#2e8b2e]">Active</p>
        </div>
        <span className="rounded bg-[#2e8b2e] px-3 py-1 text-[8px] font-semibold text-white">Edit</span>
      </div>
      <Tabs tabs={["Overview", "Job & Salary", "Documents", "Attendance", "Leave", "History"]} />
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {fields.map(([k, v]) => (
          <div key={k}>
            <p className="text-[7px] text-gray-400">{k}</p>
            <p className="break-all text-[8px] font-medium text-gray-700">{v}</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ───────── Attendance mockup ───────── */
function AttendanceMockup() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const green = [3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 22, 23, 24, 25, 29];
  const orange = [2, 13, 19, 26];
  return (
    <Frame active={2}>
      <p className="text-[10px] font-bold text-gray-900">Attendance</p>
      <Tabs tabs={["My Attendance", "Team Attendance", "Attendance Reports"]} />
      <div className="mt-3 grid gap-3 sm:grid-cols-5">
        <div className="sm:col-span-3">
          <p className="text-center text-[8px] font-semibold text-gray-700">April 2024</p>
          <div className="mt-2 grid grid-cols-7 gap-y-2 text-center text-[7px] text-gray-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d} className="text-[6px] text-gray-400">{d}</span>
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
        <div className="rounded-md border border-gray-100 p-2 sm:col-span-2">
          <p className="text-[8px] font-semibold text-gray-700">Today</p>
          <p className="mt-1 text-base font-extrabold text-gray-900">09:00 AM</p>
          <p className="text-[7px] text-gray-400">Checked In</p>
          <div className="mt-2 rounded bg-[#2e8b2e] py-1.5 text-center text-[8px] font-semibold text-white">
            Check Out
          </div>
          <div className="mt-2 flex justify-between text-[7px] text-gray-500">
            <span>Working Hours</span>
            <span>6h 30m / 8h 30m</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[8px]">
            <span className="font-semibold text-gray-700">Status</span>
            <span className="rounded-full bg-[#dcf5cf] px-2 py-0.5 font-semibold text-[#2e8b2e]">Present</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ───────── Reports mockup ───────── */
function ReportsMockup() {
  const stats = [
    ["248", "Total Employees"],
    ["12", "On Leave"],
    ["18", "New Joins"],
    ["5", "Departments"],
  ];
  const bars = [
    ["Engineering", 84, "#2e8b2e"],
    ["Design", 52, "#9bd88a"],
    ["Sales", 30, "#bbf7d0"],
    ["HR", 24, "#2e8b2e"],
    ["Marketing", 18, "#9ca3af"],
    ["Others", 14, "#9ca3af"],
  ] as const;
  return (
    <Frame active={4}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-900">Reports</p>
        <span className="rounded bg-[#2e8b2e] px-2 py-0.5 text-[7px] font-semibold text-white">Export</span>
      </div>
      <Tabs tabs={["Headcount", "Attendance", "Leave", "Department"]} />
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {stats.map(([n, l]) => (
          <div key={l} className="rounded-md border border-gray-100 p-1.5">
            <p className="text-sm font-extrabold text-gray-900">{n}</p>
            <p className="text-[6px] text-gray-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-5">
        <div className="rounded-md border border-gray-100 p-2 sm:col-span-3">
          <p className="text-[8px] font-semibold text-gray-700">Headcount by Department</p>
          <div className="mt-2 flex h-24 items-end justify-around">
            {bars.map(([l, h, c]) => (
              <div key={l} className="flex flex-col items-center gap-1">
                <span className="w-3 rounded-sm" style={{ height: h, background: c }} />
                <span className="text-[5px] text-gray-500">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-gray-100 p-2 sm:col-span-2">
          <p className="text-[8px] font-semibold text-gray-700">Leave Distribution</p>
          <div className="mt-2 flex items-center gap-2">
            <Donut size={52} segments={[["#2e8b2e", 40], ["#fbbf24", 20], ["#86efac", 15], ["#14532d", 10], ["#d1d5db", 15]]} />
            <div className="flex-1">
              <Legend
                items={[
                  ["#2e8b2e", "Annual", "40%"],
                  ["#fbbf24", "Sick", "20%"],
                  ["#86efac", "Casual", "15%"],
                  ["#14532d", "Unpaid", "10%"],
                  ["#d1d5db", "Other", "15%"],
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-[#e4f6d8] blur-3xl" />
      <div className={`${wrap} relative grid items-center gap-10 pb-12 pt-10 lg:grid-cols-2 lg:pt-14`}>
        <div>
          <span className="inline-block rounded bg-[#dcf5cf] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">
            Features
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
            All the HR Features
            <br />
            You Need in <span className="text-[#2eae1e]">One Place</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-600 xl:max-w-lg xl:text-base">
            Powerful, easy-to-use tools to manage your people, streamline HR operations, and help your business grow.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-[#2e8b2e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256f25]"
            >
              Get Started Free <ArrowRight size={15} />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2e8b2e] text-white">
                <Play size={9} fill="currentColor" />
              </span>
              Book a Demo
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
            {["Easy setup", "No credit card required", "Scales with your business", "Trusted by growing companies"].map(
              (t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#2e8b2e]" /> {t}
                </li>
              )
            )}
          </ul>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

/* ───────── Core features grid ───────── */
const coreFeatures = [
  { icon: Users, title: "Employee Management", desc: "Centralize all employee information, from onboarding to offboarding." },
  { icon: Clock3, title: "Attendance Tracking", desc: "Track check-in/out, working hours, and attendance in real time." },
  { icon: CalendarDays, title: "Leave Management", desc: "Create flexible leave policies and manage approvals effortlessly." },
  { icon: Wallet, title: "Payroll Management", desc: "Manage salaries, deductions, and generate payslips." },
  { icon: Network, title: "Organization Management", desc: "Manage departments, designations, and reporting structure." },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Get real-time insights to make better decisions." },
  { icon: FileText, title: "Document Management", desc: "Store and manage important employee documents securely." },
  { icon: ShieldCheck, title: "Role-Based Access", desc: "Control access with roles and permissions for data security." },
];

function CoreFeatures() {
  return (
    <section className="bg-white">
      <div className={`${wrap} py-10`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-[#dcf5cf] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">
            Core Features
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Everything You Need to Manage Your People
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Explore the core modules that make HRMPro a complete employee management solution.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#dcf5cf] text-[#2e8b2e]">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-sm font-bold text-gray-900">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{desc}</p>
              <Link
                href="#"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#2e8b2e] hover:underline"
              >
                Learn more <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Feature rows ───────── */
type RowProps = {
  eyebrow: string;
  title: ReactNode;
  desc: string;
  bullets: string[];
  mockup: ReactNode;
  reverse?: boolean;
};

function Row({ eyebrow, title, desc, bullets, mockup, reverse }: RowProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eefae4] blur-3xl" />
      <div className={`${wrap} relative grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16`}>
        <div className={reverse ? "lg:order-2" : ""}>
          <span className="inline-block rounded bg-[#dcf5cf] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 xl:text-4xl">{title}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600">{desc}</p>
          <ul className="mt-4 space-y-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2e8b2e] text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="#"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#2e8b2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#256f25]"
          >
            Learn more <ArrowRight size={14} />
          </Link>
        </div>
        <div className={reverse ? "lg:order-1" : ""}>{mockup}</div>
      </div>
    </section>
  );
}

/* ───────── Page ───────── */
export default function FeaturesPage() {
  return (
    <main>
      <Hero />
      <CoreFeatures />

      <Row
        eyebrow="Employee Management"
        title={
          <>
            Complete Employee
            <br />
            Information in One Place
          </>
        }
        desc="Store and manage all employee details, documents, job history, departments, and reporting structure. Keep your organization organized and up to date."
        bullets={[
          "Detailed employee profiles",
          "Department and designation management",
          "Onboarding and offboarding workflows",
          "Employee document storage",
        ]}
        mockup={<EmployeeMockup />}
      />

      <Row
        reverse
        eyebrow="Attendance & Leave"
        title={
          <>
            Simplify Attendance
            <br />
            and Leave Management
          </>
        }
        desc="Track attendance, manage working hours, and automate leave requests with an easy approval workflow."
        bullets={[
          "Check-in and check-out",
          "Flexible leave policies",
          "Leave balance tracking",
          "Approval workflow for managers",
        ]}
        mockup={<AttendanceMockup />}
      />

      <Row
        eyebrow="Reports & Analytics"
        title="Make Data-Driven Decisions"
        desc="Get detailed reports and analytics to understand your workforce, track attendance trends, and monitor leave patterns."
        bullets={[
          "Headcount and department reports",
          "Attendance and leave analytics",
          "Custom report generation",
          "Export to PDF and Excel",
        ]}
        mockup={<ReportsMockup />}
      />
    </main>
  );
}