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
}

export const projects: Project[] = [
  {
    slug: "superdocs",
    title: "SuperDocs",
    description:
      "The open-source Mintlify alternative. CLI-first docs engine that transforms Markdown into beautiful, searchable documentation sites. Features hot reload, MDX support, SEO optimization, and full landing page control.",
    image:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&h=400&fit=crop&crop=entropy&auto=format",
    tags: ["TypeScript", "Astro", "CLI"],
    status: "In Development",
    githubOwner: "DevRohit06",
    githubRepo: "superdocs",
    npm: "https://www.npmjs.com/package/super-docs",
    demo: "https://devrohit06.github.io/superdocs-demo/",
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
    slug: "klaro",
    title: "Klaro",
    description:
      "A single billing system that adapts to many industries with pluggable business types. Features flexible catalogs, adaptive UI, multi-tenant architecture, and handles orders, invoices, payments across retail, services, healthcare, and education.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&crop=entropy&auto=format",
    tags: ["Multi-tenant", "PWA", "Billing"],
    status: "In Development",
    technologies: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((project) => project.slug);
}
