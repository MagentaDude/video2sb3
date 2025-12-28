import { defineConfig } from "vite";

export default defineConfig({
  base: '/video2sb3/',
  optimizeDeps: {
    include: ["@breezystack/lamejs"],
  },
});