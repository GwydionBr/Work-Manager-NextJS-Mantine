import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA || "dev";

module.exports = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: COMMIT_SHA,
  },
};
