/**
 * Admin session cookie signing/verification using Web Crypto (Edge middleware + Node server).
 */

export const ADMIN_COOKIE_NAME = "ck_admin_session";

/** Default cookie max-age (seconds). */
export const ADMIN_SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

function utf8ToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function bytesToUtf8(b: Uint8Array): string {
  return new TextDecoder().decode(b);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a[i]! ^ b[i]!;
  return x === 0;
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const secretBytes = new Uint8Array(utf8ToBytes(secret));
  const messageBytes = new Uint8Array(utf8ToBytes(message));
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, messageBytes);
  return new Uint8Array(buf);
}

/** Fallback when unset (demo / low-friction local use). */
const DEFAULT_ADMIN_SECRET = "coffee";

export function getAdminTokenSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_DASHBOARD_PASSWORD?.trim() ||
    DEFAULT_ADMIN_SECRET
  );
}

export async function signAdminSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_SEC * 1000;
  const payload = JSON.stringify({ exp });
  const sig = await hmacSha256(secret, payload);
  return `${bytesToBase64Url(utf8ToBytes(payload))}.${bytesToBase64Url(sig)}`;
}

export async function verifyAdminSessionToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  let payload: string;
  try {
    payload = bytesToUtf8(base64UrlToBytes(payloadB64));
  } catch {
    return false;
  }
  let sig: Uint8Array;
  try {
    sig = base64UrlToBytes(sigB64);
  } catch {
    return false;
  }
  const expectedSig = await hmacSha256(secret, payload);
  if (!timingSafeEqualBytes(sig, expectedSig)) return false;
  try {
    const parsed = JSON.parse(payload) as { exp?: number };
    if (typeof parsed.exp !== "number" || parsed.exp <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
