import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle for container/Cloud deploys
  // (Docker, Azure Web App / Container Apps, Cloud Run, etc.).
  output: "standalone",
};

export default nextConfig;
