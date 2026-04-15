"use client";

import { deleteBookingById } from "@/app/actions/adminBooking";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AdminDeleteBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this booking? Capacity on the booking page will free up.")) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const result = await deleteBookingById(bookingId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
        className="text-xs font-medium text-red-800 underline decoration-red-800/30 underline-offset-2 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? (
        <p className="max-w-[14rem] text-right text-[0.65rem] leading-snug text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
