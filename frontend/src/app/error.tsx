"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-slate-600">Please try loading this page again.</p>
      <button
        className="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
        onClick={() => reset()}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
