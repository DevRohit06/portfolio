# Project Structure & Organization

## Directory Layout

```
src/
├── components/          # UI Components organized by framework
│   ├── astro/          # Pure Astro components
│   ├── react/          # React components for interactive features
│   ├── svelte/         # Svelte components with transitions
│   ├── bento/          # Bento grid specific components
│   └── icons/          # Icon components with index.ts exports
├── content/            # Content collections (blog, projects)
├── layouts/            # Page layout templates
├── lib/                # Utility functions and configurations
├── pages/              # File-based routing
│   └── api/            # API endpoints using Hono
├── styles/             # Global CSS and component-specific styles
├── types/              # TypeScript type definitions
└── utils/              # Animation and utility scripts
```

## Component Organization Patterns

### Multi-Framework Components

- **Astro components**: Static content, layouts, SEO components
- **React components**: Complex interactive features (carousels, charts)
- **Svelte components**: Smooth animations and state management
- **Framework-specific folders**: Keep components organized by their framework

### Component Naming

- Use PascalCase for component files
- Include framework suffix when ambiguous (e.g., `ThreeBackground.jsx`)
- Group related components in subfolders (e.g., `bento/`, `icons/`)

## Content Management

- **Blog posts**: MDX files in `src/content/blog/`
- **Projects**: MDX files in `src/content/projects/` (when implemented)
- **Content collections**: Defined in `src/content.config.js` with Zod schemas
- **Assets**: Static assets in `public/`, processed assets in `src/assets/`

## API Structure

- **Serverless functions**: `src/pages/api/` with Hono framework
- **Service layer**: `src/pages/api/_services/` for external integrations
- **GitHub integration**: Dedicated service folder for GitHub API calls

## Styling Conventions

- **CSS Variables**: Use for theming (`--text-primary`, `--card-bg`, etc.)
- **TailwindCSS**: Primary styling approach with custom utilities
- **Component styles**: Scoped styles in component files when needed
- **Responsive design**: Mobile-first approach with Tailwind breakpoints

## File Naming

- **Components**: PascalCase (e.g., `ExperienceToggler.svelte`)
- **Utilities**: camelCase (e.g., `metaData.ts`)
- **Pages**: kebab-case for URLs (e.g., `coming-soon.astro`)
- **Content**: kebab-case (e.g., `ai-driven-web-development.mdx`)
