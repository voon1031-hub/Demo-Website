import type { NextConfig } from "next";

// The site builds to plain static files in out/, so it can be hosted anywhere.
// GitHub Pages serves this repo from /<repo-name>/; the deploy workflow passes
// that prefix in PAGES_BASE_PATH. Locally it is empty.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
