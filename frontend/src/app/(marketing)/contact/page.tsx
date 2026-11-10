"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type FormStatus = {
  type: "success" | "error";
  message: string;
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
    };

    setIsSubmitting(true);
    setFormStatus(null);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true) {
        throw new Error(result?.error?.message || "We couldn't send your message. Please try again.");
      }

      form.reset();
      setFormStatus({
        type: "success",
        message: "Thanks for contacting HRMPro! Your message has been saved successfully.",
      });
    } catch (error) {
      setFormStatus({
        type: "error",
        message:
          error instanceof TypeError
            ? "Unable to connect to the server. Please make sure the backend is running and try again."
            : error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-gradient-to-br from-green-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-950"><ArrowLeft aria-hidden="true" size={16} />Back to Home</Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-green-700">Contact HRMPro</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">Let’s talk about your team’s needs</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Have a question about employee management, attendance or leave workflows? Use the form below to share your message.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-5 lg:px-8 lg:py-20">
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-green-700">Get in touch</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">How can we help?</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">Tell us what you need help with, and include enough detail for your message to be understood.</p>
          <Image
            src="/assets/contact-support.svg"
            alt="Illustration of a support conversation next to a message form."
            width={360}
            height={190}
            priority
            className="my-5 h-auto w-full max-w-xs"
          />
          <div className="mt-7 space-y-4">
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold">Product questions</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Learn about the employee, department, attendance and leave management modules.</p>
              <Link href="/features" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green-800 hover:text-green-950">Explore features <ArrowRight aria-hidden="true" size={16} /></Link>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold">Already have an account?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Open your HRMPro workspace to access the available management tools.</p>
              <Link href="/login" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green-800 hover:text-green-950">Sign in <ArrowRight aria-hidden="true" size={16} /></Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold">Send a message</h2>
            <p className="mt-2 text-sm text-slate-600">Complete the fields below. All fields are required.</p>

            {formStatus && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-5 rounded-lg border p-3 text-sm ${
                  formStatus.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {formStatus.message}
              </div>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Your name" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email address
                <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                Subject
                <input name="subject" required minLength={3} maxLength={150} placeholder="How can we help?" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                Message
                <textarea name="message" required minLength={10} maxLength={3000} rows={5} placeholder="Tell us a little more..." className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </label>

              <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                <label>
                  Leave this field empty
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
            </div>

            <button disabled={isSubmitting} type="submit" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Sending..." : <>Send Message <ArrowRight aria-hidden="true" size={16} /></>}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <Link href="/" className="font-extrabold text-slate-900">HRMPro</Link>
          <div className="flex flex-wrap gap-5">
            <Link href="/features" className="hover:text-green-700">Features</Link>
            <Link href="/solutions" className="hover:text-green-700">Solutions</Link>
            <Link href="/about" className="hover:text-green-700">About</Link>
            <Link href="/login" className="hover:text-green-700">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} HRMPro</span>
        </div>
      </footer>
    </main>
  );
}
