import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Meta and Telegram webhooks are tested through a tunnel in development.
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.trycloudflare.com",
    "*.pinggy.link",
    "*.loca.lt",
  ],
};

export default nextConfig;
