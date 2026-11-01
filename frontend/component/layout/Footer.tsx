import Link from "next/link";
import { Globe, Mail, MessageCircle, Share2 } from "lucide-react";

const columns = [
  { title: "Product", links: ["Features", "Pricing", "Integrations", "Changelog"] },
  { title: "Company", links: ["About", "Contact", "Privacy Policy", "Terms of Service"] },
  { title: "Resources", links: ["Help Center", "Documentation", "Blog", "Support"] },
];

// Swap these generic icons for brand icons (e.g. react-icons) if you prefer.
const socials = [Share2, MessageCircle, Globe, Mail];

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-[#2e8b2e] text-[11px] font-extrabold text-white">
                HR
              </span>
              <span className="text-lg font-extrabold tracking-tight text-[#143d1f]">HRMPro</span>
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-gray-500">
              A modern employee management system to help businesses manage their people, simplify HR operations, and
              grow with confidence.
            </p>
          </div>

          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-bold text-gray-900">{c.title}</h4>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-xs text-gray-500 transition hover:text-[#2e8b2e]">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-gray-400">© 2026 HRMPro. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-700">Follow Us</span>
            {socials.map((Icon, i) => (
              <Link
                key={i}
                href="#"
                aria-label="social link"
                className="grid h-7 w-7 place-items-center rounded-md bg-[#2e8b2e] text-white transition hover:bg-[#256f25]"
              >
                <Icon size={14} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}