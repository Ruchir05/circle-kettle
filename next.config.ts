import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Avoid bundling issues for Supabase in server actions / Route Handlers on Vercel. */
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr"],
};

export default nextConfig;
