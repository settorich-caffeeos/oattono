import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle for container/Cloud deploys
  // (Docker, Azure Web App / Container Apps, Cloud Run, etc.).
  output: "standalone",
  // Keep the PDF parser (and its pdfjs worker) unbundled so it resolves its
  // worker file from node_modules at runtime instead of a rewritten path.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
