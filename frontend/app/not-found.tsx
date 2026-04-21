import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
        Error 404
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base text-stone-600">
        The link may be broken or the page may have been removed. You can go back
        to the home page to continue.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
      >
        Back to home
      </Link>
    </div>
  );
}
