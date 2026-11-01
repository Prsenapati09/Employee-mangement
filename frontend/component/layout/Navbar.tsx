"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Solutions", href: "/solutions" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Home matches only "/", other links also match their sub-pages (e.g. /features/payroll)
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[#2e8b2e] text-[11px] font-extrabold text-white">
            HR
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[#143d1f]">HRMPro</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors hover:text-[#2e8b2e] ${
                isActive(l.href) ? "text-[#2e8b2e]" : "text-gray-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/signin"
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-[#2e8b2e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#256f25]"
          >
            Get Started
          </Link>
        </div>

        <button
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-md px-2 py-3 text-sm font-medium hover:bg-[#f1fae9] hover:text-[#2e8b2e] ${
                  isActive(l.href) ? "bg-[#f1fae9] text-[#2e8b2e]" : "text-gray-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link href="/login" className="rounded-md border border-gray-200 py-2 text-center text-sm font-semibold">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-md bg-[#2e8b2e] py-2 text-center text-sm font-semibold text-white">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}