type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({
  title,
  description = "This page is reserved for a future HRMPro feature.",
}: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        HRMPro
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
        {description}
      </p>
    </main>
  );
}
