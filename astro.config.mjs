// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import node from "@astrojs/node";

import playformCompress from "@playform/compress";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      GITHUB_ACCESS_TOKEN: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "load",
  },

  integrations: [svelte(), react(), mdx(), playformCompress()],

  adapter: node({
    mode: "standalone",
  }),
});