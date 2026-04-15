import { createAnonClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type CoffeeCupRow = {
  coffee_slug: string;
  max_cups: number;
  booked: number;
  remaining: number;
};

export async function GET() {
  try {
    const client = createAnonClient();
    if (!client) {
      return NextResponse.json({ cups: [] as CoffeeCupRow[], demo: true });
    }

    const { data, error } = await client.rpc("get_coffee_cup_availability");
    if (error) {
      const rpcError = [error.message, (error as { details?: string }).details]
        .filter(Boolean)
        .join(" — ")
        .slice(0, 400);
      return NextResponse.json({
        cups: [] as CoffeeCupRow[],
        demo: false,
        supabase_error: rpcError,
      });
    }

    const rows = Array.isArray(data)
      ? (data as CoffeeCupRow[]).map((r) => ({
          coffee_slug: String(r.coffee_slug),
          max_cups: Number(r.max_cups),
          booked: Number(r.booked),
          remaining: Math.max(0, Number(r.remaining)),
        }))
      : [];

    return NextResponse.json({ cups: rows, demo: false });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "coffee_cups_failed", message },
      { status: 500 },
    );
  }
}
