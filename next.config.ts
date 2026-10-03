import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Meta and Telegram webhooks are tested through a tunnel in development.
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.trycloudflare.com",
    "*.pinggy.link",
    "*.loca.lt",
    "crmdemo.valolabs.site",
    "*.valolabs.site",
  ],
};

export default nextConfig;
