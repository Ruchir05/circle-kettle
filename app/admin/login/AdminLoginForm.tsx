"use client";

import type { AdminLoginState } from "@/app/actions/adminAuth";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

const initial: AdminLoginState = { ok: true, message: "" };

type Props = {
  action: (prev: AdminLoginState, formData: FormData) => Promise<AdminLoginState>;
};

export function AdminLoginForm({ action }: Props) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="next" value={next} />
      <div>
        <label
          htmlFor="admin-username"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]"
        >
          Username
        </label>
        <input
          id="admin-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="form-field w-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
          placeholder="coffee"
        />
      </div>
      <div>
        <label
          htmlFor="admin-password"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground-muted)]"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="form-field w-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
          placeholder="coffee"
        />
      </div>
      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-[color:var(--foreground-muted)]" : "text-red-700"}`}
          role={state.ok ? undefined : "alert"}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-4 py-3 text-sm font-medium text-[color:var(--surface)] transition-opacity disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
