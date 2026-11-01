"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Handshake,
  Mail,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  MessageSquare,
  Minus,
  Package,
  Phone,
  Plus,
  Send,
  Tag,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[1600px] xl:px-12";

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

/* ───────── Hero ───────── */
const topics: { icon: LucideIcon; label: string }[] = [
  { icon: MessageSquare, label: "General Inquiries" },
  { icon: Package, label: "Product Information" },
  { icon: Tag, label: "Pricing & Plans" },
  { icon: Wrench, label: "Technical Support" },
  { icon: Handshake, label: "Partnership Opportunities" },
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-24 top-0 h-[460px] w-[460px] rounded-full bg-[#e4f6d8] blur-3xl" />
      <div className={`${wrap} relative grid items-center gap-12 pb-12 pt-10 lg:grid-cols-2 lg:pt-14`}>
        <div>
          <Eyebrow>Contact Us</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
            Let’s Talk About
            <br />
            Your <span className="text-[#2eae1e]">HR Needs</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-600 xl:max-w-lg xl:text-base">
            Have questions about HRMPro? We’d love to hear from you. Our team is here to help you find the right
            solution for your business.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="#message"
              className="inline-flex items-center gap-2 rounded-md bg-[#2e8b2e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256f25]"
            >
              <Send size={15} /> Send a Message
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              <CalendarDays size={15} className="text-[#2e8b2e]" /> Book a Demo
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600">
            {["Quick response", "Expert support", "Tailored solutions"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check size={14} className="text-[#2e8b2e]" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Photo with floating cards */}
        <div className="relative pb-6 lg:pl-10">
          {/* Replace this block with a next/image photo */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#d7f0c8] to-[#6fbf5c] shadow-xl shadow-green-900/10">
            <div className="absolute inset-0 grid place-items-center text-white/70">
              <User size={80} />
            </div>
          </div>

          <div className="absolute -bottom-0 left-2 rounded-xl bg-white p-4 shadow-xl sm:-left-2">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#bfe8b0] text-[#2e8b2e]"
                >
                  <User size={14} />
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm font-extrabold leading-tight text-gray-900">
              Our team is here
              <br />
              to help you
            </p>
            <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online
            </p>
          </div>

          <ul className="absolute right-2 top-4 hidden w-56 space-y-3 rounded-xl bg-white p-4 shadow-xl sm:block md:-right-2">
            {topics.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-[11px] text-gray-700">
                <span className="grid h-5 w-5 place-items-center rounded bg-[#dcf5cf] text-[#2e8b2e]">
                  <Icon size={11} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Get in touch + form ───────── */
const channels: { icon: LucideIcon; title: string; lines: string[] }[] = [
  { icon: Mail, title: "Email", lines: ["support@hrmpro.com", "We reply within 24 hours"] },
  { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "Mon – Fri, 9AM – 6PM (IST)"] },
  {
    icon: MapPin,
    title: "Office Address",
    lines: ["123 Business Park, Tech Street", "Bhubaneswar, Odisha 751024, India"],
  },
  { icon: MessageCircle, title: "Live Chat", lines: ["Chat with our team", "Available on our website"] },
];

const inputClass =
  "mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#2e8b2e] focus:ring-2 focus:ring-[#2e8b2e]/20";

const subjects = [
  "General Inquiry",
  "Product Information",
  "Pricing & Plans",
  "Technical Support",
  "Partnership Opportunities",
];

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const emptyForm: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  subject: "General Inquiry",
  message: "",
};

function Required() {
  return <span className="text-red-500"> *</span>;
}

function GetInTouch() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    try {
      // TODO: connect to your API route, e.g.
      // await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
      setForm(emptyForm);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="message" className="bg-white">
      <div className={`${wrap} grid gap-6 py-8 lg:grid-cols-2`}>
        {/* Left: channels */}
        <div className="rounded-2xl bg-[#f1fae9] p-6 sm:p-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Get in Touch</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
            Choose the best way to reach us. We’re available through multiple channels to assist you.
          </p>
          <div className="mt-6 space-y-3">
            {channels.map(({ icon, title, lines }) => (
              <div key={title} className="flex items-center gap-4 rounded-xl border border-[#e3f3d8] bg-white p-4">
                <IconBox icon={icon} size={48} />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                  <p className="text-sm font-medium text-gray-800">{lines[0]}</p>
                  <p className="text-xs text-gray-500">{lines[1]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-green-900/5 sm:p-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Send Us a Message</h2>
          <p className="mt-1 text-xs text-gray-600">Fill out the form and we’ll get back to you as soon as possible.</p>

          {sent && (
            <p className="mt-4 rounded-md bg-[#f1fae9] px-3 py-2 text-xs font-medium text-[#256f25]" role="status">
              Thanks! Your message has been sent. We’ll reply within 24 hours.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-800">
              Full Name
              <Required />
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="John Doe"
                className={inputClass}
              />
            </label>
            <label className="text-xs font-semibold text-gray-800">
              Company Name
              <input
                name="company"
                value={form.company}
                onChange={onChange}
                placeholder="Your Company"
                className={inputClass}
              />
            </label>
            <label className="text-xs font-semibold text-gray-800">
              Email Address
              <Required />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="john@example.com"
                className={inputClass}
              />
            </label>
            <label className="text-xs font-semibold text-gray-800">
              Phone Number
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </label>
            <label className="text-xs font-semibold text-gray-800 sm:col-span-2">
              Subject
              <Required />
              <select name="subject" value={form.subject} onChange={onChange} required className={inputClass}>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-800 sm:col-span-2">
              Message
              <Required />
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                required
                rows={4}
                placeholder="How can we help you?"
                className={`${inputClass} resize-none`}
              />
            </label>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2e8b2e] py-3 text-sm font-semibold text-white transition hover:bg-[#256f25] disabled:opacity-70 sm:col-span-2"
            >
              <Send size={15} /> {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ───────── Office ───────── */
function Office() {
  return (
    <section className="bg-white">
      <div className={`${wrap} grid items-center gap-8 py-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12`}>
        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          {/* OpenStreetMap embed (no API key). Swap src for a Google Maps embed URL if you prefer. */}
          <iframe
            title="HRMPro office location, Bhubaneswar"
            src="https://www.openstreetmap.org/export/embed.html?bbox=85.76%2C20.26%2C85.89%2C20.33&layer=mapnik&marker=20.2961%2C85.8245"
            className="h-64 w-full sm:h-72"
            loading="lazy"
          />
        </div>

        <div>
          <Eyebrow>Our Office</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">Visit Our Office</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-600">
            We’d love to welcome you to our office. Schedule a visit to meet our team and see how HRMPro can work for
            your business.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <IconBox icon={MapPin} size={44} />
              <div className="text-[11px] leading-snug text-gray-500">
                <p className="text-xs font-bold text-gray-900">123 Business Park</p>
                <p>Tech Street, Bhubaneswar</p>
                <p>Odisha 751024, India</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <IconBox icon={Clock3} size={44} />
              <div className="text-[11px] leading-snug text-gray-500">
                <p className="text-xs font-bold text-gray-900">Office Hours</p>
                <p>Mon – Fri: 9AM – 6PM</p>
                <p>Sat – Sun: Closed</p>
              </div>
            </div>
          </div>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Bhubaneswar%2C+Odisha"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#2e8b2e] px-5 py-2.5 text-xs font-semibold text-[#2e8b2e] transition hover:bg-[#f1fae9]"
          >
            <MapIcon size={14} /> Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
const faqs = [
  { q: "How quickly will you respond to my inquiry?", a: "We reply to every message within 24 hours on business days." },
  { q: "Do you offer a free demo?", a: "Yes. Book a demo and our team will walk you through HRMPro for your business." },
  { q: "Can HRMPro be customized for my business?", a: "Absolutely. Departments, roles, approval workflows, and policies are all configurable." },
  { q: "Do you provide onboarding and training?", a: "Yes. We help you set up your organization and train your team to get started quickly." },
  { q: "What industries do you support?", a: "We support technology, healthcare, manufacturing, retail, education, and professional services." },
  { q: "Is there a minimum number of employees required?", a: "No. HRMPro works for teams of any size, from small businesses to enterprises." },
  { q: "Do you offer technical support?", a: "Yes. All plans include support, and Enterprise includes a dedicated account manager." },
  { q: "How can I become a partner with HRMPro?", a: "Send us a message with the subject “Partnership Opportunities” and our team will get in touch." },
];

function Faq() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="bg-[#f4fbee]">
      <div className={`${wrap} py-10`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">Frequently Asked Questions</h2>
            <p className="mt-1 text-xs text-gray-600">
              Find answers to common questions. Can’t find what you’re looking for? Contact us directly.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#2e8b2e] hover:underline"
          >
            View All FAQs <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-5 grid items-start gap-x-4 gap-y-2.5 md:grid-cols-2">
          {faqs.map((f) => {
            const isOpen = open === f.q;
            return (
              <div key={f.q} className="rounded-md border border-gray-200 bg-white">
                <button
                  onClick={() => setOpen(isOpen ? null : f.q)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs text-gray-800"
                >
                  {f.q}
                  {isOpen ? <Minus size={14} className="shrink-0" /> : <Plus size={14} className="shrink-0" />}
                </button>
                {isOpen && <p className="px-4 pb-3 text-xs leading-relaxed text-gray-500">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA ───────── */
function Cta() {
  return (
    <section id="demo" className="bg-white py-8">
      <div className={wrap}>
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#e4f6d8] px-6 py-6 md:flex-row md:items-center md:px-10">
          <div>
            <span className="inline-block rounded bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2e8b2e]">
              Ready to get started?
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-[#143d1f] sm:text-2xl">
              Make People Management Simpler Today
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
              href="#message"
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
export default function ContactPage() {
  return (
    <main>
      <Hero />
      <GetInTouch />
      <Office />
      <Faq />
      <Cta />
    </main>
  );
}