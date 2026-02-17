import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://jaralabs.github.io",
  base: "/snoopy-game",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});
