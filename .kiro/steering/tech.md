# Technology Stack

## Framework & Build System

- **Primary Framework**: Astro 5.x with static site generation
- **Package Manager**: npm (with bun.lockb present, bun is also supported)
- **Build Target**: Static site deployed to Vercel
- **TypeScript**: Strict configuration with React JSX support

## UI Frameworks & Libraries

- **Multi-framework approach**: Astro components + React + Svelte islands
- **Styling**: TailwindCSS 4.x with custom CSS variables for theming
- **Animations**: GSAP for complex animations, Svelte transitions for component-level
- **Typography**: Custom Roobert font family

## Key Dependencies

- **Content**: MDX for blog posts with Astro content collections
- **UI Components**: Embla Carousel, React Heat Map
- **API**: Hono for serverless functions
- **External Integrations**: GitHub API, Discord API, Open Graph scraping
- **SEO**: astro-seo, sitemap generation, structured data

## Development Commands

```bash
# Development server
npm run dev          # Starts dev server at localhost:4321
bun dev             # Alternative with bun

# Production build
npm run build       # Build for production
npm run preview     # Preview production build locally

# Astro CLI
npm run astro       # Access Astro CLI commands
```

## Environment Variables

- `GITHUB_ACCESS_TOKEN` (server-side, secret)
- `PUBLIC_VERCEL_*` (client-side, deployment info)
- `PUBLIC_GOOGLE_TAG_KEY` (client-side, analytics)

## Deployment

- **Platform**: Vercel with automatic deployments
- **Adapter**: @astrojs/vercel for serverless functions
- **Compression**: @playform/compress for asset optimization
