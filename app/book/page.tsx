import { BookForm } from "@/app/book/BookForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a tasting",
  description:
    "Reserve a 30-minute slot at Circle Kettle (UIUC) for up to four guests—Saturday, April 18, 2026, 1–5 PM.",
};

export default function BookPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">
          Reservations
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-[color:var(--foreground)] sm:text-5xl">
          Book a tasting
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[color:var(--foreground-muted)]">
          Saturday, April 18, 2026 · 1:00–5:00 PM at{" "}
          <span className="text-[color:var(--foreground)]">
            1004 W Main Street, Urbana, IL 61801, Unit 204
          </span>
          . Choose a half-hour window, up to four people, and a coffee—or pick Unsure and we will
          pour something that fits the table.
        </p>
      </header>

      <div className="mt-14">
        <BookForm />
      </div>
    </main>
  );
}
