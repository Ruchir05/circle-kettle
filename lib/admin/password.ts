import { createHash, timingSafeEqual } from "node:crypto";

/** Timing-safe compare via SHA-256 digests (same length). */
export function verifyAdminPassword(input: string, expected: string | undefined): boolean {
  if (expected == null || expected.length === 0) return false;
  const ih = createHash("sha256").update(input, "utf8").digest();
  const eh = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(ih, eh);
}
