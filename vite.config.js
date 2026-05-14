import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Allow dev access via tunnels (localhost.run, ngrok, etc.). The hostname
    // rotates each session, so we whitelist the suffixes rather than pin URLs.
    allowedHosts: [".lhr.life", ".ngrok-free.app", ".ngrok.io", ".trycloudflare.com"],
  },
});