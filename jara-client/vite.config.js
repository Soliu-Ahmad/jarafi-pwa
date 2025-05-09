import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
      ],
      manifest: "/manifest.json",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"], // Cache all necessary file types
        maximumFileSizeToCacheInBytes: 9 * 1024 * 1024, // 6MB

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image", // Cache images
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"), // Cache API requests
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),

    nodePolyfills({
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      crypto: "crypto-browserify",
    },
  },

  optimizeDeps: {
    exclude: ["chunk-OTONJH47.js"],
    include: ["bs58", "idb"],
  },
});
