import { POPUP_VENUE_ADDRESS_LINES } from "@/lib/config";

export function SiteFooter() {
  const addressLine = POPUP_VENUE_ADDRESS_LINES.join(" · ");

  return (
    <footer className="mt-auto border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-[color:var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-[color:var(--foreground)]">Circle Kettle</p>
        <p>{addressLine}</p>
      </div>
    </footer>
  );
}
