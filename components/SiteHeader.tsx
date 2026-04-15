"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const onBookPage = pathname === "/book";

  return (
    <header
      className="border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 backdrop-blur-sm"
      suppressHydrationWarning
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[color:var(--foreground)] transition-opacity hover:opacity-80 sm:text-2xl"
        >
          Circle Kettle
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <nav aria-label="Main" className="flex items-center gap-4 text-sm font-medium sm:gap-6">
            <Link
              href={onBookPage ? "/" : "/book"}
              className="text-[color:var(--foreground-muted)] underline-offset-4 transition-colors hover:text-[color:var(--foreground)] hover:underline"
            >
              {onBookPage ? t("nav.home") : t("nav.bookTasting")}
            </Link>
          </nav>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
