import { adminLogin } from "@/app/actions/adminAuth";
import { ADMIN_COOKIE_NAME, getAdminTokenSecret, verifyAdminSessionToken } from "@/lib/admin/token";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const secret = getAdminTokenSecret();
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (secret && token && (await verifyAdminSessionToken(token, secret))) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-muted)]">
        Circle Kettle
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Admin sign-in</h1>
      <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
        Sign in with username and password (defaults are both <strong className="text-[color:var(--foreground)]">coffee</strong> unless
        you set <code className="text-xs">ADMIN_DASHBOARD_*</code> in the environment).
      </p>
      <Suspense fallback={null}>
        <AdminLoginForm action={adminLogin} />
      </Suspense>
      <p className="mt-10 text-center text-sm text-[color:var(--foreground-muted)]">
        <Link href="/" className="underline decoration-[color:var(--border)] underline-offset-4">
          Back to site
        </Link>
      </p>
    </div>
  );
}
