import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const features = [
  "Admin-approved onboarding",
  "Secure account provisioning",
  "Organization-specific access",
  "Guided setup for your team",
];

function Logo() {
  return (
    <Link href="/" className="flex w-fit items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-green-700 text-xs font-extrabold text-white">
        HR
      </span>
      <span className="text-lg font-extrabold tracking-tight text-green-950">
        HRMPro
      </span>
    </Link>
  );
}

function WorkspaceIllustration() {
  return (
    <div aria-hidden="true" className="relative mt-8 h-64">
      <div className="absolute bottom-0 left-0 h-48 w-full rounded-[45%] bg-green-200" />
      <div className="absolute bottom-0 left-16 grid h-56 w-48 place-items-end justify-items-center overflow-hidden rounded-t-full bg-gradient-to-b from-green-200 to-green-700 text-white/80">
        <svg viewBox="0 0 120 120" className="mb-1 h-32 w-32 fill-current">
          <circle cx="60" cy="35" r="23" />
          <path d="M17 120c3-29 17-45 43-45s40 16 43 45H17Z" />
        </svg>
      </div>
      <div className="absolute bottom-8 left-0 w-40 rounded-xl bg-white p-3 shadow-xl shadow-green-900/10">
        <p className="text-[9px] font-bold text-gray-900">Your organization</p>
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-green-100" />
              <span className="h-1.5 flex-1 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-5 w-40 rounded-xl bg-white p-3 shadow-xl shadow-green-900/10">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-green-100 text-sm font-bold text-green-700">
            <Check aria-hidden="true" size={16} />
          </span>
          <div>
            <p className="text-[9px] font-bold text-gray-900">Team workspace</p>
            <p className="text-[8px] text-green-700">Set up by an admin</p>
          </div>
        </div>
        <div className="mt-3 flex h-8 items-end justify-end gap-1">
          {[14, 22, 18, 30].map((height) => (
            <span
              key={height}
              className="w-2 rounded-sm bg-green-700"
              style={{ height }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 p-4 sm:p-6">
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-white to-green-100 shadow-xl shadow-green-900/10 lg:grid-cols-2">
        <section className="relative hidden flex-col p-10 lg:flex xl:p-12">
          <Logo />
          <div className="mt-14">
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">
              Get Started
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 xl:text-5xl">
              Create Your
              <br />
              <span className="text-green-600">Organization</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
              HRMPro keeps your team and everyday people operations organized.
              Account setup is managed securely by your administrator.
            </p>
            <ul className="mt-5 space-y-2.5">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2.5 text-sm text-gray-700"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-green-700 text-xs font-bold text-white">
                    <Check aria-hidden="true" size={14} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <WorkspaceIllustration />
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8 lg:p-10">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg shadow-green-900/5 sm:p-8">
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">
              Administrator-managed
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
              Create an Account
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              New organization and owner accounts are created by an authorized
              administrator. Contact your organization administrator to
              request access to HRMPro.
            </p>

            <div
              role="note"
              className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-sm font-semibold text-amber-900">
                Public self-registration is not enabled
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                Your account must be provisioned securely before you can sign
                in. No registration details or provisioning secrets are
                collected on this page.
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-lg bg-green-50 p-4">
              {features.slice(0, 3).map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-green-700 text-[10px] font-bold text-white">
                    <Check aria-hidden="true" size={14} />
                  </span>
                  <span className="text-xs text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-600/20"
            >
              Go to Sign In <ArrowRight aria-hidden="true" size={16} />
            </Link>

            <p className="mt-5 text-center text-xs text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-green-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
