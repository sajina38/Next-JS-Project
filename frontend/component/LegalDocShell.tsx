import type { ReactNode } from "react";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3 text-gray-600">{children}</div>
    </section>
  );
}

export default function LegalDocShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="font-[var(--font-inter)] bg-[#fafaf9]">
      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12 border-b border-gray-200 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-3">{lastUpdated}</p>
        </header>
        <div className="space-y-10 text-gray-700 leading-relaxed text-base">
          {children}
        </div>
      </article>
    </div>
  );
}
