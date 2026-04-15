import { BookForm } from "@/app/book/BookForm";
import { BookPageHeader } from "@/app/book/BookPageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a tasting",
  description:
    "Reserve a 30-minute slot at Circle Kettle (UIUC) for up to four guests—Saturday, April 18, 2026, 1–5 PM.",
};

export default function BookPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <BookPageHeader />

      <div className="mt-14">
        <BookForm />
      </div>
    </main>
  );
}
