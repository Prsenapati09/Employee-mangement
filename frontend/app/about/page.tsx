import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Box,
  Building2,
  Check,
  Eye,
  Globe,
  GraduationCap,
  Hash,
  Headphones,
  Heart,
  LayoutGrid,
  MapPin,
  Play,
  Rocket,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[1600px] xl:px-12";

/* ───────── Reusable pieces ───────── */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded bg-[#dcf5cf] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">
      {children}
    </span>
  );
}

function IconBox({ icon: Icon, size = 44 }: { icon: LucideIcon; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl bg-[#dcf5cf] text-[#2e8b2e]"
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.5} />
    </span>
  );
}

/**
 * Photo placeholder. Pass a real image path to `src` (for example "/images/team.jpg")
 * and it renders with next/image. Without `src` it shows a green placeholder.
 */
function Photo({
  src,
  alt,
  icon: Icon = Users,
  className = "",
}: {
  src?: string;
  alt: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#d7f0c8] to-[#6fbf5c] ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-white/70">
          <Icon size={72} />
        </div>
      )}
    </div>
  );
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-24 top-0 h-[460px] w-[460px] rounded-full bg-[#e4f6d8] blur-3xl" />
      <div className={`${wrap} relative grid items-center gap-12 pb-14 pt-10 lg:grid-cols-2 lg:pt-14`}>
        <div>
          <Eyebrow>About Us</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
            Our Mission is to
            <br />
            Simplify <span className="text-[#2eae1e]">HR</span> for
            <br />
            <span className="text-[#2eae1e]">Every Business</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-600 xl:max-w-lg xl:text-base">
            We build modern HR software that helps businesses manage their people, save time, and focus on what matters
            most — growth.
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

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-gray-700">
            {[
              { icon: ShieldCheck, label: "People First" },
              { icon: Users, label: "Trusted by Businesses" },
              { icon: Zap, label: "Committed to Innovation" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={18} className="text-[#2e8b2e]" /> {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Photo with floating cards */}
        <div className="relative pb-6 lg:pl-6">
          <Photo
            alt="HRMPro team collaborating"
            icon={Users}
            className="aspect-[4/3] w-full rounded-3xl shadow-xl shadow-green-900/10"
          />
          <div className="absolute -bottom-0 left-2 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl sm:-left-4">
            <IconBox icon={Users} size={40} />
            <div>
              <p className="text-xl font-extrabold leading-none text-gray-900">100+</p>
              <p className="mt-1 text-[10px] text-gray-500">Happy Companies</p>
            </div>
          </div>
          <div className="absolute right-2 top-4 w-36 rounded-xl bg-white px-4 py-4 shadow-xl sm:-right-4 sm:top-8 sm:w-40">
            <p className="text-sm font-extrabold leading-tight text-gray-900">A Better Workplace Starts Here</p>
            <span className="mt-3 block h-0.5 w-5 bg-[#2e8b2e]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Our story ───────── */
const stats = [
  { icon: Building2, value: "100+", label: "Businesses Trust Us" },
  { icon: Users, value: "50K+", label: "Employees Managed" },
  { icon: Globe, value: "10+", label: "Countries" },
];

function Story() {
  return (
    <section className="bg-white">
      <div className={`${wrap} grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-14`}>
        <div className="relative pb-24 sm:pb-0">
          <Photo
            alt="Modern open-plan office"
            icon={Building2}
            className="aspect-[4/3] w-full rounded-2xl shadow-lg sm:w-[85%]"
          />
          <div className="absolute bottom-0 right-0 w-64 rounded-2xl bg-[#f1fae9] p-5 shadow-xl sm:-bottom-6 sm:right-0 sm:w-60 xl:w-64">
            <Building2 size={24} className="text-[#2e8b2e]" />
            <h3 className="mt-3 text-lg font-extrabold leading-tight text-gray-900">
              Building the Future of Work
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-600">
              We believe great businesses are built by great people. HRMPro helps you create an environment where
              everyone can do their best work.
            </p>
          </div>
        </div>

        <div>
          <Eyebrow>Our Story</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 xl:text-4xl">
            From a Simple Idea to a
            <br />
            <span className="text-[#2eae1e]">Growing HR Platform</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-600">
            HRMPro was founded with a simple goal — to make employee management easier, more efficient, and more human.
            What started as a small idea has grown into a comprehensive HR solution used by companies across different
            industries.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stats.map(({ icon, value, label }) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <IconBox icon={icon} size={40} />
                <p className="mt-3 text-xl font-extrabold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Mission, vision, values ───────── */
const values = ["People First", "Simplicity", "Integrity", "Continuous Innovation", "Customer Success"];

function Purpose() {
  return (
    <section className="bg-[#f1fae9]">
      <div className={`${wrap} grid gap-5 py-10 lg:grid-cols-4`}>
        <div className="lg:pr-4">
          <Eyebrow>Our Purpose</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900">
            Our Mission, Vision
            <br />
            <span className="text-[#2eae1e]">and Values</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            We are committed to helping organizations build better workplaces through simple, powerful, and
            people-centric HR technology.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <IconBox icon={Target} size={44} />
          <h3 className="mt-4 text-sm font-bold text-gray-900">Our Mission</h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            To simplify people management for businesses of all sizes through innovative and easy-to-use HR solutions.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <IconBox icon={Eye} size={44} />
          <h3 className="mt-4 text-sm font-bold text-gray-900">Our Vision</h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            To become a global leader in HR technology, empowering businesses to build happier, more productive teams.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <IconBox icon={Heart} size={44} />
          <h3 className="mt-4 text-sm font-bold text-gray-900">Our Values</h3>
          <ul className="mt-3 space-y-2">
            {values.map((v) => (
              <li key={v} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#2e8b2e] text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Why choose ───────── */
const reasons = [
  { icon: Settings, title: "Built for Real Businesses", desc: "Practical features designed for daily HR operations." },
  { icon: Users, title: "Easy to Use", desc: "A clean and intuitive interface for everyone." },
  { icon: BarChart3, title: "Scalable with You", desc: "From small teams to large enterprises." },
  { icon: Headphones, title: "Dedicated Support", desc: "We are here to help you succeed." },
];

function WhyChoose() {
  return (
    <section className="bg-white">
      <div className={`${wrap} grid items-center gap-10 py-12 lg:grid-cols-[1fr_1.3fr_0.9fr]`}>
        <div>
          <Eyebrow>Why Choose HRMPro</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900">
            A People-Centric
            <br />
            <span className="text-[#2eae1e]">Approach</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-600">
            We combine technology, simplicity, and a deep understanding of HR challenges to deliver a solution that
            truly works for you.
          </p>
          <Link
            href="#"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#2e8b2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#256f25]"
          >
            Learn More <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {reasons.map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <IconBox icon={icon} size={44} />
              <div>
                <h3 className="text-xs font-bold text-gray-900">{title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <Photo
            alt="Smiling HR professional"
            icon={Users}
            className="aspect-[4/5] w-full rounded-2xl shadow-lg"
          />
          <div className="absolute right-2 top-6 w-32 rounded-xl bg-white px-4 py-4 shadow-xl sm:-right-3">
            <p className="text-sm font-extrabold leading-tight text-gray-900">
              People
              <br />
              Processes
              <br />
              Progress
            </p>
            <span className="mt-3 block h-0.5 w-5 bg-[#2e8b2e]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Journey ───────── */
const journey = [
  { icon: Sprout, year: "2021", title: "The Beginning", desc: "HRMPro was founded with a vision to simplify HR." },
  { icon: Users, year: "2022", title: "First Customers", desc: "Onboarded our first set of businesses." },
  { icon: GraduationCap, year: "2023", title: "Product Expansion", desc: "Launched new features for attendance and leave." },
  { icon: BarChart3, year: "2024", title: "Growing Globally", desc: "Reached 100+ companies and 50K+ users." },
  { icon: Rocket, year: "2025", title: "Next Chapter", desc: "Continuing to innovate for a better future of work." },
];

function Journey() {
  return (
    <section className="bg-white">
      <div className={`${wrap} grid gap-8 py-10 lg:grid-cols-[240px_1fr]`}>
        <div>
          <Eyebrow>Our Journey</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
            Our <span className="text-[#2eae1e]">Journey</span>
          </h2>
          <p className="mt-2 text-xs text-gray-500">Key milestones that have shaped HRMPro.</p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          <div className="absolute left-6 right-6 top-6 hidden border-t-2 border-dashed border-[#bfe8b0] lg:block" />
          {journey.map(({ icon: Icon, year, title, desc }) => (
            <div key={year} className="relative">
              <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-[#dcf5cf] text-[#2e8b2e] ring-4 ring-white">
                <Icon size={22} />
              </span>
              <p className="mt-3 text-xs font-extrabold text-[#2e8b2e]">{year}</p>
              <h3 className="text-xs font-bold text-gray-900">{title}</h3>
              <p className="mt-1 max-w-[170px] text-[11px] leading-snug text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Trusted by ───────── */
const brands: { name: string; icon: LucideIcon | null }[] = [
  { name: "Google", icon: null },
  { name: "Microsoft", icon: LayoutGrid },
  { name: "Slack", icon: Hash },
  { name: "airbnb", icon: MapPin },
  { name: "shopify", icon: ShoppingBag },
  { name: "Dropbox", icon: Box },
];

function Trusted() {
  return (
    <section className="bg-white">
      <div className={`${wrap} py-6`}>
        <div className="grid items-center gap-5 rounded-2xl bg-[#eefae4] px-6 py-6 lg:grid-cols-[220px_1fr]">
          <div>
            <Eyebrow>Trusted by Businesses</Eyebrow>
            <h2 className="mt-2 text-lg font-extrabold leading-tight text-gray-900">
              Businesses That
              <br />
              Believe in Us
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 text-gray-500">
            {brands.map(({ name, icon: Icon }) => (
              <span key={name} className="flex items-center gap-1.5 text-lg font-semibold">
                {Icon && <Icon size={18} />} {name}
              </span>
            ))}
          </div>
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
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#e4f6d8] px-6 py-7 md:flex-row md:items-center md:px-10">
          <div>
            <span className="inline-block rounded bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">
              Join Us
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-[#143d1f] sm:text-2xl">
              Let’s Build a Better Workplace <span className="text-[#2eae1e]">Together</span>
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Join hundreds of businesses that trust HRMPro to manage their people.
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
export default function AboutPage() {
  return (
    <main>
      <Hero />
      <Story />
      <Purpose />
      <WhyChoose />
      <Journey />
      <Trusted />
      <Cta />
    </main>
  );
}