# AI Agent Instructions for Portfolio Project

## Architecture Overview

This is an **Astro-based portfolio site** with a multi-framework component architecture. The site uses **component islands** with React, Svelte, and vanilla Astro components coexisting. Static generation is the default, with dynamic API routes for GitHub integration.

**Key architectural decisions:**
- **Static-first**: Uses `output: "static"` with server-rendered API endpoints
- **Framework mixing**: React (`client:load`/`client:only`), Svelte (`client:load`), Astro (server-rendered)
- **Theme system**: Pre-rendered theme script (`/public/theme-init.js`) runs before page load to prevent FOUC
- **Animation-heavy**: GSAP with ScrollTrigger drives all scroll animations; cleanup required on navigation

## Critical File Locations

```
src/
├── components/           # Mixed framework components
│   ├── *.astro          # Server-rendered Astro components
│   ├── react/           # React islands (Embla carousels, heatmaps)
│   └── svelte/          # Svelte islands (theme changer, Discord status)
├── content/blog/        # MDX blog posts (Astro content collections)
├── layouts/             # Page layouts with SEO + Analytics
├── lib/                 # Core utilities and data
│   ├── metaData.ts      # Centralized meta descriptions with responsive line breaks
│   ├── projects.ts      # Project data source (use this, not hardcoded arrays)
│   ├── graphql.ts       # GitHub GraphQL queries
│   └── customTransition.ts  # Astro View Transitions config
├── pages/
│   ├── index.astro      # Homepage with GSAP animations
│   ├── blogs/[slug].astro   # Dynamic blog routes with TOC
│   ├── projects/[slug].astro # Dynamic project pages with GitHub API
│   └── api/             # API routes for GitHub data
├── styles/global.css    # CSS custom properties (--bg-primary, --accent-primary, etc.)
└── utils/animations.js  # GSAP animation library
```

## Developer Workflows

### Build & Dev Commands
```bash
bun dev       # Dev server at localhost:4321
bun build     # Static build to dist/
bun preview   # Preview production build
```

### Adding New Content

**Blog posts** (MDX with content collections):
1. Create `.mdx` file in `src/content/blog/`
2. Add frontmatter: `title`, `description`, `date`, `image`, `tags`
3. Dynamic route at `/blogs/[slug].astro` auto-generates pages via `getStaticPaths`

**Projects** (GitHub-integrated):
1. Add entry to `src/lib/projects.ts` array with `githubRepo`, `npmPackage`, `demoLink`
2. Dynamic route at `/projects/[slug].astro` fetches README from GitHub API
3. Uses `marked` for markdown parsing, `ContentWrapper` for rendering

### Theme System
- Theme preference stored in `localStorage.theme` ("dark" | "light")
- `/public/theme-init.js` runs synchronously before DOM render
- CSS variables defined in `src/styles/global.css` under `:root` and `.dark-theme`
- Theme toggle component: `src/components/svelte/ThemeChanger.svelte`

## Project-Specific Conventions

### Component Hydration Strategy
- **`client:load`**: Interactive components needed immediately (theme changer, Discord status)
- **`client:visible`**: Lazy-loaded on scroll (GitHub activity chart in bento grid)
- **`client:only="react"`**: Framework-specific components (Three.js background)
- **Server-rendered**: All `.astro` components by default (SEO-friendly)

### CSS Variable System
All colors use CSS custom properties for theme switching:
```css
var(--bg-primary)      /* Main background */
var(--bg-secondary)    /* Card backgrounds */
var(--text-primary)    /* Main text */
var(--accent-primary)  /* Brand color (blue in light, red in dark) */
var(--accent-primary-rgb)  /* RGB values for alpha variants */
```

### GSAP Animation Patterns
**Critical**: GSAP instances must be cleaned up on navigation to prevent stale ScrollTriggers.

```javascript
// In page scripts
import { cleanupGSAPAnimations, fadeInUp } from '../utils/animations.js';

// Setup animations
document.addEventListener('astro:page-load', () => {
  fadeInUp('.animate-element', { 
    scrollTrigger: { trigger: '.section' } 
  });
});

// REQUIRED: Cleanup before navigation
document.addEventListener('astro:before-preparation', () => {
  cleanupGSAPAnimations();
});
```

Available animation functions: `fadeInUp`, `fadeInLeft`, `fadeInRight`, `scaleIn`, `createParallax`, `floatingAnimation`, `animateMenuText`

### Dynamic Routing Pattern
Follow this pattern for `getStaticPaths`:

```astro
---
import { projects } from '../../lib/projects';

export async function getStaticPaths() {
  return projects.map(project => ({
    params: { slug: project.slug },
    props: { project }
  }));
}

const { project } = Astro.props;
---
```

### Markdown Rendering
- **Blogs**: Use Astro content collections (`getCollection("blog")`) + `render()` method
- **External markdown** (GitHub READMs): Use `marked` package, render with `ContentWrapper.astro`
- ContentWrapper applies `.blog-content` prose styles for consistent typography

### GitHub API Integration
API routes in `src/pages/api/_services/github/` use:
- `GITHUB_ACCESS_TOKEN` from `astro:env/server` (never expose client-side)
- `graphql-request` for GitHub GraphQL API queries (defined in `src/lib/graphql.ts`)
- Caching handled by Vercel edge functions in production

### Environment Variables
Defined in `astro.config.mjs` with type safety:
- `GITHUB_ACCESS_TOKEN` - Server-only, for GitHub API
- `PUBLIC_GOOGLE_TAG_KEY` - Client-accessible, for Analytics
- `PUBLIC_VERCEL_*` - Auto-injected by Vercel

### SEO & Meta Tags
- Use `Seo.astro` component in layouts (wraps `astro-seo`)
- JSON-LD structured data for blogs via `BlogJsonLd.astro`
- Open Graph images: default `/images/og.webp`, override per page
- Canonical URLs: Always pass `Astro.url.href` to layout

## Common Gotchas

1. **GSAP memory leaks**: Always call `cleanupGSAPAnimations()` on `astro:before-preparation` event
2. **Theme flash**: Never set theme in component `onMount` - use `/public/theme-init.js` only
3. **Hydration mismatches**: Don't use `new Date()` or random values in server-rendered content
4. **Content collections**: Content must be in `src/content/blog/` - files outside won't be detected
5. **API routes**: Use `.ts` extension for type safety, export `GET`/`POST` as named exports
6. **CSS imports**: Global styles in `Layout.astro`, component styles in `<style>` tags
7. **Fish shell**: No heredocs - use `printf` or `echo` for multi-line terminal commands

## Integration Points

- **Lanyard API**: Real-time Discord presence via WebSocket (Svelte component)
- **GitHub GraphQL API**: Contribution heatmap, repo stats, README fetching
- **Vercel Analytics**: Partytown-wrapped Google Analytics in `Layout.astro`
- **Open Graph Scraper**: Server-side for website preview cards
- **Three.js**: WebGL background in React component with `client:only`

## Key Dependencies

- `astro@5.x` - Framework (static site generation)
- `gsap@3.x` - Scroll-driven animations
- `lenis@1.x` - Smooth scroll (imported in `Layout.astro`)
- `marked@16.x` - Markdown parsing for GitHub READMEs
- `graphql-request@7.x` - GitHub API queries
- `embla-carousel-react@8.x` - Testimonials carousel
- `@uiw/react-heat-map@2.x` - GitHub contribution chart

## Testing Patterns

No formal test suite. Manual testing checklist:
1. Theme toggle in light/dark mode
2. GSAP animations on scroll (no stutter or repetition)
3. Blog navigation with View Transitions
4. Project pages fetch GitHub data correctly
5. Discord status updates in real-time
6. Mobile responsiveness (all components)

## Code Style Preferences

- **TypeScript**: Strict mode enabled, use type imports (`import type`)
- **Formatting**: Prefer functional components, destructure props
- **Naming**: kebab-case for files/folders, PascalCase for components
- **Imports**: Group by external → internal → components → styles
- **Comments**: Explain "why" not "what" - use JSDoc for public functions

When in doubt, check existing patterns in `src/pages/blogs/[slug].astro` (dynamic routing), `src/utils/animations.js` (GSAP patterns), or `src/components/svelte/ThemeChanger.svelte` (reactive state management).
