// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import node from "@astrojs/node";

import playformCompress from "@playform/compress";

import vercel from "@astrojs/vercel";

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
      PUBLIC_VERCEL_ENV: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "development",
      }),
      PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_VERCEL_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
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
