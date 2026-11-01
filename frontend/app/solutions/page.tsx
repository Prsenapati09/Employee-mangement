import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building,
  Building2,
  Check,
  Factory,
  GraduationCap,
  HeartPulse,
  Laptop,
  LayoutDashboard,
  Link2,
  Play,
  Settings,
  Store,
  User,
  UserCog,
  Users,
  Video,
  Hash,
  Clock3,
  CalendarCheck,
  FileText,
} from "lucide-react";

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[1600px] xl:px-12";

/* Small reusable pieces */
function Eyebrow({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <span
      className={`inline-block rounded bg-[#dcf5cf] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e] ${
        center ? "mx-auto" : ""
      }`}
    >
      {children}
    </span>
  );
}

function CheckItem({ children, small = false }: { children: ReactNode; small?: boolean }) {
  return (
    <li className={`flex items-center gap-2 text-gray-700 ${small ? "text-xs" : "text-sm"}`}>
      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#2e8b2e] text-white">
        <Check size={10} strokeWidth={3} />
      </span>
      {children}
    </li>
  );
}

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h2>
      {desc && <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{desc}</p>}
    </div>
  );
}

/* ───────── Hero mockup ───────── */
const sideItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Users, label: "Employees" },
  { icon: Clock3, label: "Attendance" },
  { icon: CalendarCheck, label: "Leave" },
  { icon: BarChart3, label: "Reports" },
  { icon: FileText, label: "Documents" },
  { icon: Settings, label: "Settings" },
];

function DashboardMockup() {
  const stats = [
    ["248", "Employees"],
    ["12", "On Leave"],
    ["8", "Pending"],
    ["5", "Departments"],
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-green-900/10">
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="grid h-4 w-4 place-items-center rounded bg-[#2e8b2e] text-[6px] font-extrabold text-white">
            HR
          </span>
          <span className="text-[9px] font-bold text-[#143d1f]">HRMPro</span>
        </div>
        <span className="h-4 w-28 rounded bg-gray-100" />
      </div>
      <div className="flex">
        <aside className="hidden w-[20%] min-w-[84px] bg-[#1e4d2b] p-2 sm:block">
          {sideItems.map((s, i) => (
            <div
              key={s.label}
              className={`mb-1 flex items-center gap-1.5 rounded px-1.5 py-1.5 text-[8px] text-white/80 ${
                i === 0 ? "bg-white/15 font-semibold text-white" : ""
              }`}
            >
              <s.icon size={9} /> {s.label}
            </div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-3">
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
              <p className="text-[8px] font-semibold text-gray-700">Headcount Trend</p>
              <svg viewBox="0 0 200 70" className="mt-1 h-20 w-full">
                <defs>
                  <linearGradient id="hc" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#2e8b2e" stopOpacity=".25" />
                    <stop offset="1" stopColor="#2e8b2e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 60 L40 52 L80 46 L120 40 L160 26 L200 16 L200 70 L0 70Z" fill="url(#hc)" />
                <path d="M0 60 L40 52 L80 46 L120 40 L160 26 L200 16" fill="none" stroke="#2e8b2e" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="col-span-2 rounded-md border border-gray-100 p-2">
              <p className="text-[8px] font-semibold text-gray-700">Employees by Department</p>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="relative h-12 w-12 shrink-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#2e8b2e 0 40%, #86efac 40% 60%, #14532d 60% 75%, #bbf7d0 75% 90%, #d1d5db 90% 100%)",
                  }}
                >
                  <div className="absolute inset-[24%] rounded-full bg-white" />
                </div>
                <div className="space-y-0.5 text-[6px] text-gray-500">
                  <p>Engineering 40%</p>
                  <p>Design 20%</p>
                  <p>Sales 15%</p>
                  <p>HR 15%</p>
                  <p>Others 10%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-[#e4f6d8] blur-3xl" />
      <div className={`${wrap} relative grid items-center gap-10 pb-12 pt-10 lg:grid-cols-2 lg:pt-14`}>
        <div>
          <Eyebrow>Solutions</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
            Flexible Solutions
            <br />
            for <span className="text-[#2eae1e]">Every Business</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-600 xl:max-w-lg xl:text-base">
            Whether you are a startup, a growing company, or a large enterprise, HRMPro adapts to your unique HR needs
            and helps you manage your people with ease.
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
            {["Tailored to your industry", "Scales with your team", "Trusted by growing businesses"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check size={14} className="text-[#2e8b2e]" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <DashboardMockup />
          <p className="mt-3 text-right text-xs italic text-[#2e8b2e] lg:absolute lg:-right-2 lg:top-8 lg:mt-0 lg:w-24 lg:translate-x-full lg:text-left xl:hidden">
            A solution that grows with you
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────── Industries ───────── */
const industries = [
  { icon: Laptop, title: "Technology", desc: "Manage fast-growing teams with ease.", selected: true },
  { icon: HeartPulse, title: "Healthcare", desc: "Handle complex shifts and compliance needs." },
  { icon: Factory, title: "Manufacturing", desc: "Manage shift-based workforces efficiently." },
  { icon: Store, title: "Retail", desc: "Simplify multi-location employee management." },
  { icon: GraduationCap, title: "Education", desc: "Manage staff, faculty, and administrative teams." },
  { icon: Briefcase, title: "Professional Services", desc: "Streamline HR for consulting and service firms." },
];

function Industries() {
  return (
    <section className="bg-white">
      <div className={`${wrap} py-10`}>
        <SectionHead
          eyebrow="By Industry"
          title="Solutions for Your Industry"
          desc="Every industry has different people management needs. HRMPro provides flexible solutions that can be adapted to your workflows and compliance requirements."
        />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {industries.map(({ icon: Icon, title, desc, selected }) => (
            <div
              key={title}
              className={`rounded-xl border p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md ${
                selected ? "border-[#bfe8b0] bg-[#f1fae9]" : "border-gray-100 bg-white"
              }`}
            >
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-[#dcf5cf] text-[#2e8b2e]">
                <Icon size={22} />
              </span>
              <h3 className="mt-3 text-xs font-bold text-gray-900">{title}</h3>
              <p className="mt-1 text-[11px] leading-snug text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Roles ───────── */
const roles = [
  {
    icon: UserCog,
    title: "HR Administrators",
    items: ["Manage employee records", "Configure policies", "Generate reports", "Ensure compliance"],
  },
  {
    icon: Users,
    title: "Managers",
    items: ["Approve leave requests", "Monitor team attendance", "Track team performance", "Manage team schedules"],
  },
  {
    icon: User,
    title: "Employees",
    items: ["View and update profile", "Apply for leave", "Check attendance", "Access documents and payslips"],
  },
  {
    icon: Settings,
    title: "Company Administrators",
    items: [
      "Manage organization settings",
      "Control user access",
      "Configure integrations",
      "Monitor system usage",
    ],
  },
];

function Roles() {
  return (
    <section className="bg-white">
      <div className={`${wrap} py-10`}>
        <SectionHead
          eyebrow="By Role"
          title="Built for Every Role"
          desc="Each role gets the tools and access they need to be productive."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map(({ icon: Icon, title, items }) => (
            <div key={title} className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#2e8b2e] text-white">
                  <Icon size={20} />
                </span>
                <h3 className="text-xs font-bold text-gray-900">{title}</h3>
              </div>
              <ul className="mt-4 flex-1 space-y-2.5">
                {items.map((i) => (
                  <CheckItem key={i} small>
                    {i}
                  </CheckItem>
                ))}
              </ul>
              <Link
                href="#"
                className="mt-5 inline-flex items-center justify-center gap-1 rounded-md border border-[#2e8b2e] py-2 text-xs font-semibold text-[#2e8b2e] transition hover:bg-[#f1fae9]"
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

/* ───────── Business size ───────── */
const sizes = [
  {
    icon: Building2,
    title: "Small Business",
    sub: "1–50 employees",
    items: ["Quick and easy setup", "Essential HR features", "Affordable pricing"],
  },
  {
    icon: BarChart3,
    title: "Growing Business",
    sub: "51–200 employees",
    items: ["Advanced HR workflows", "Team management tools", "Detailed reporting"],
  },
  {
    icon: Building,
    title: "Enterprise",
    sub: "200+ employees",
    items: ["Custom workflows and permissions", "Advanced security and compliance", "Dedicated support"],
  },
];

function BusinessSize() {
  return (
    <section className="bg-white">
      <div className={`${wrap} py-10`}>
        <SectionHead
          eyebrow="By Business Size"
          title="A Solution That Scales With You"
          desc="From small teams to large enterprises, HRMPro grows with your business."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {sizes.map(({ icon: Icon, title, sub, items }) => (
            <div key={title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#dcf5cf] text-[#2e8b2e]">
                  <Icon size={28} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {items.map((i) => (
                  <CheckItem key={i} small>
                    {i}
                  </CheckItem>
                ))}
              </ul>
              <Link
                href="#"
                className="mx-auto mt-5 block w-40 rounded-md border border-[#2e8b2e]/60 py-2 text-center text-xs font-semibold text-gray-800 transition hover:bg-[#f1fae9]"
              >
                View Solution
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Custom solutions ───────── */
function OrgMockup() {
  const depts = [
    ["Engineering", "24 employees"],
    ["Design", "12 employees"],
    ["Human Resources", "8 employees"],
    ["Sales", "16 employees"],
    ["Marketing", "10 employees"],
  ];
  const Node = ({ name, sub }: { name: string; sub: string }) => (
    <div className="flex flex-col items-center">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#bfe8b0] to-[#2e8b2e] text-white">
        <User size={13} />
      </span>
      <p className="mt-1 text-[9px] font-bold text-gray-900">{name}</p>
      <p className="text-[7px] text-gray-400">{sub}</p>
    </div>
  );
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-0 rounded-2xl bg-[#e4f6d8]" />
      <div className="relative flex items-end gap-0 p-4 sm:p-6">
        {/* Person placeholder: replace with your next/image photo */}
        <div className="hidden w-[30%] shrink-0 self-end sm:block">
          <div className="grid h-52 place-items-center rounded-t-full bg-gradient-to-b from-[#bfe8b0] to-[#2e8b2e] text-white">
            <User size={64} />
          </div>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-xl shadow-green-900/10 sm:-ml-6">
          <p className="text-[10px] font-bold text-gray-900">Organization Structure</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-5">
            <div className="space-y-1.5 sm:col-span-2">
              {depts.map(([n, s]) => (
                <div key={n} className="flex items-center gap-2 rounded border border-gray-100 p-1.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#dcf5cf] text-[#2e8b2e]">
                    <User size={9} />
                  </span>
                  <div>
                    <p className="text-[8px] font-semibold text-gray-800">{n}</p>
                    <p className="text-[6px] text-gray-400">{s}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center sm:col-span-3">
              <div className="rounded-md border border-gray-100 px-4 py-1.5 shadow-sm">
                <Node name="CEO" sub="1 employee" />
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="h-px w-3/4 bg-gray-300" />
              <div className="mt-0 grid w-full grid-cols-3 gap-1 pt-3">
                <Node name="Engineering" sub="24 employees" />
                <Node name="Design" sub="12 employees" />
                <Node name="Marketing" sub="10 employees" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomSolutions() {
  const bullets = [
    "Custom organizational structure",
    "Flexible approval workflows",
    "Location and branch management",
    "Support for multi-country operations",
    "Integration with your existing tools",
  ];
  return (
    <section className="bg-white">
      <div className={`${wrap} grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16`}>
        <OrgMockup />
        <div>
          <Eyebrow>Custom Solutions</Eyebrow>
          <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">Adapt to Your Unique Requirements</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600">
            Configure departments, roles, approval workflows, and policies to match your organization’s structure and
            processes.
          </p>
          <ul className="mt-4 space-y-2.5">
            {bullets.map((b) => (
              <CheckItem key={b}>{b}</CheckItem>
            ))}
          </ul>
          <Link
            href="#demo"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#2e8b2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#256f25]"
          >
            Request a Custom Demo <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────── Integrations ───────── */
function MsLogo() {
  return (
    <span className="grid h-6 w-6 grid-cols-2 gap-0.5">
      <i className="bg-[#f25022]" />
      <i className="bg-[#7fba00]" />
      <i className="bg-[#00a4ef]" />
      <i className="bg-[#ffb900]" />
    </span>
  );
}

const integrations: { name: string; logo: ReactNode }[] = [
  { name: "Google Workspace", logo: <span className="text-2xl font-extrabold text-[#4285F4]">G</span> },
  { name: "Microsoft 365", logo: <MsLogo /> },
  { name: "Slack", logo: <Hash size={24} className="text-[#611f69]" /> },
  {
    name: "Zoom",
    logo: (
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2d8cff] text-white">
        <Video size={16} />
      </span>
    ),
  },
  {
    name: "QuickBooks",
    logo: (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#2ca01c] text-[10px] font-extrabold text-white">
        qb
      </span>
    ),
  },
  { name: "Custom Integrations", logo: <Link2 size={24} className="text-[#2e8b2e]" /> },
];

function Integrations() {
  return (
    <section className="bg-white">
      <div className={`${wrap} py-10`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Integrations</Eyebrow>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900">Works Seamlessly With Your Tools</h2>
            <p className="mt-1 text-xs text-gray-600">Connect HRMPro with the tools your team already uses.</p>
          </div>
          <Link
            href="#"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#2e8b2e] hover:underline"
          >
            View All Integrations <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {integrations.map(({ name, logo }) => (
            <div
              key={name}
              className="flex items-center justify-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-4 shadow-sm"
            >
              {logo}
              <span className="text-[11px] font-semibold text-gray-800">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Testimonials ───────── */
const testimonials = [
  {
    quote: "HRMPro has simplified our HR processes and saved us hours of manual work.",
    name: "Emily Carter",
    role: "Operations Manager, TechCorp",
  },
  {
    quote: "The platform is easy to use and has great support. Highly recommended!",
    name: "Michael Tan",
    role: "CEO, GrowthLabs",
  },
  {
    quote: "A complete solution for managing our distributed teams.",
    name: "Priya Sharma",
    role: "HR Head, InnovateX",
  },
];

function Testimonials() {
  return (
    <section className="bg-white">
      <div className={`${wrap} py-8`}>
        <Eyebrow>Customer Success</Eyebrow>
        <h2 className="mt-3 text-2xl font-extrabold text-gray-900">What Our Customers Say</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
              <blockquote className="text-xs leading-relaxed text-gray-700">“{t.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-2.5">
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

/* ───────── CTA ───────── */
function Cta() {
  return (
    <section className="bg-white pb-10">
      <div className={wrap}>
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#e4f6d8] px-6 py-6 md:flex-row md:items-center md:px-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">
              Ready to find the right solution?
            </span>
            <h2 className="mt-1 text-xl font-extrabold text-[#143d1f] sm:text-2xl">
              Let’s Build a Better Workplace Together
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Book a personalized demo to see how HRMPro can work for your business.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-[#2e8b2e] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#256f25]"
            >
              Get Started Free <ArrowRight size={14} />
            </Link>
            <Link
              href="#demo"
              className="rounded-md border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Page ───────── */
export default function SolutionsPage() {
  return (
    <main>
      <Hero />
      <Industries />
      <Roles />
      <BusinessSize />
      <CustomSolutions />
      <Integrations />
      <Testimonials />
      <Cta />
    </main>
  );
}