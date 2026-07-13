import DiscordLanyardActivityImage from "../assets/discord-lanyard-activity.png";

export interface Project {
  slug: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  status: "Completed" | "In Development";
  githubOwner?: string;
  githubRepo?: string;
  npm?: string;
  demo?: string;
  technologies?: string[];
  /** When true, this project has a hand-built page at /projects/<slug> instead
   *  of the auto-generated GitHub-backed detail page. */
  customPage?: boolean;
}

export const projects: Project[] = [
  {
    slug: "lito",
    title: "Lito",
    description:
      "The open-source Mintlify alternative. CLI-first docs engine that transforms Markdown into beautiful, searchable documentation sites. Features 20+ MDX components, offline search powered by Pagefind, OpenAPI integration, i18n, and dual-theme support.",
    image:
      "/blog-images/superdocs.webp",
    tags: ["TypeScript", "Astro", "CLI"],
    status: "In Development",
    githubOwner: "Lito-docs",
    githubRepo: "cli",
    npm: "https://www.npmjs.com/package/@devrohit06/superdocs",
    demo: "https://lito.rohitk06.in",
    technologies: [
      "TypeScript",
      "Astro",
      "MDX",
      "Tailwind CSS",
      "CLI",
      "Static Site Generation",
    ],
  },
  {
    slug: "aura-ide",
    title: "Aura IDE",
    description:
      "A modern, AI-powered cloud IDE built with SvelteKit 5 featuring agentic coding assistance and isolated sandbox environments. Includes intelligent code suggestions, smart debugging, multi-model AI support (GPT-4o, Claude), real-time collaboration, and integrated terminal with live preview.",
    image:
      "https://raw.githubusercontent.com/DevRohit06/aura-ide/refs/heads/main/images/hero.png",
    tags: ["SvelteKit", "GenAI", "Cloud IDE"],
    status: "In Development",
    githubOwner: "DevRohit06",
    githubRepo: "aura-ide",
    technologies: [
      "SvelteKit 5",
      "TypeScript",
      "CodeMirror 6",
      "AI SDK",
      "Daytona",
      "MongoDB",
    ],
  },
  {
    slug: "discord-lanyard-activity",
    title: "Discord Lanyard Activity",
    description:
      "A headless, framework-agnostic Discord activity tracker using Lanyard API. Real-time presence tracking with support for React, Vue, Svelte, and vanilla JavaScript. Tracks music services, games, and custom activities.",
    image:
      DiscordLanyardActivityImage?.src,
    tags: ["TypeScript", "WebSocket", "Multi-Framework"],
    status: "Completed",
    githubOwner: "DevRohit06",
    githubRepo: "discord-lanyard-activity",
    npm: "https://www.npmjs.com/package/discord-lanyard-activity",
    demo: "https://discord-lanyard-activity.vercel.app/",
    technologies: [
      "TypeScript",
      "WebSocket",
      "React",
      "Vue 3",
      "Svelte",
      "Vite",
      "tsup",
      "Lanyard API",
    ],
  },
  {
    slug: "discli",
    title: "discli",
    description:
      "Discord CLI for AI agents and humans. Manage servers, send messages, react, handle DMs, threads, and monitor events from the terminal. Built with security profiles, audit logging, and rate limiting for safe AI agent integration.",
    image:
      "/blog-images/discli.svg",
    tags: ["Python", "CLI", "Discord"],
    status: "Completed",
    githubOwner: "DevRohit06",
    githubRepo: "discli",
    technologies: [
      "Python",
      "discord.py",
      "Click",
      "Async",
      "JSONL",
      "Claude Agent SDK",
    ],
  },
  {
    slug: "big-calendar",
    title: "Big Calendar (Svelte)",
    description:
      "A feature-rich calendar for SvelteKit, built with Svelte 5 runes, Tailwind v4, and shadcn-svelte. Day, week, month, and agenda views with drag-and-drop events. A Svelte port of the popular lramos33/big-calendar.",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop&crop=entropy&auto=format",
    tags: ["Svelte 5", "SvelteKit", "Calendar"],
    status: "Completed",
    githubOwner: "DevRohit06",
    githubRepo: "big-calendar-svelte",
    demo: "https://big-calendar.rohitk06.in/",
    technologies: [
      "Svelte 5",
      "SvelteKit",
      "TypeScript",
      "Tailwind CSS v4",
      "shadcn-svelte",
    ],
  },
  {
    slug: "ocopus",
    title: "Ocopus",
    customPage: true,
    description:
      "An AI-native, multi-tenant SaaS POS, inventory, and billing platform for restaurants, salons, gyms, and cafés. A business-adapter pattern lets one codebase serve many business types, with an offline-first POS, real-time order updates, inventory and reservations, loyalty, and multi-gateway payments, plus MCP tools for AI agents and a personal AI assistant on the way.",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop&crop=entropy&auto=format",
    tags: ["Multi-tenant", "SaaS", "POS"],
    status: "In Development",
    technologies: [
      "SvelteKit",
      "Svelte 5",
      "NestJS",
      "Prisma",
      "PostgreSQL",
      "BullMQ",
      "WebSockets",
      "PWA",
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  // Exclude projects that have a hand-built custom page, so the dynamic
  // [slug] route doesn't collide with the dedicated page.
  return projects
    .filter((project) => !project.customPage)
    .map((project) => project.slug);
}
