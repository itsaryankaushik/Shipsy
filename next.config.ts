import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // set the workspace root explicitly (you can also use a specific path)
    root: process.cwd(),
  },
  /* config options here */
};

export default nextConfig;
