import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    server: { entry: "server" },
  },
  vite: {
    server: {
      watch: {
        // Prevent Vite from scanning build outputs or node_modules
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/dist/**",
          "**/.output/**",
          "**/.nitro/**",
          "**/.tanstack/**",
        ],
      },
    },
    optimizeDeps: {
      // Avoid re-scanning dependency trees on every dev server boot
      holdUntilCanned: true,
    },
  },
});