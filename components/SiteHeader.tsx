import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [{ href: "/book", label: "Book a tasting" }];

export function SiteHeader() {
  return (
    <header className="border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[color:var(--foreground)] transition-opacity hover:opacity-80 sm:text-2xl"
        >
          Circle Kettle
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav aria-label="Main" className="flex items-center gap-6 text-sm font-medium">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[color:var(--foreground-muted)] underline-offset-4 transition-colors hover:text-[color:var(--foreground)] hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
