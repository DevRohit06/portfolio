/**
 * Markdown renderer with syntax highlighting using Shiki
 * This provides the same syntax highlighting as blog posts for GitHub READMEs
 */

import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { codeToHtml } from 'shiki';

// Shiki theme configuration to match Astro's defaults
const SHIKI_THEMES = {
  light: 'github-light',
  dark: 'github-dark',
};

// Store for mermaid code blocks (keyed by a unique marker)
const mermaidBlocks = new Map<string, string>();

/**
 * Create a marked instance with Shiki syntax highlighting and mermaid support
 */
export async function createMarkedWithShiki() {
  // Clear mermaid blocks from previous renders
  mermaidBlocks.clear();

  const marked = new Marked(
    markedHighlight({
      async: true,
      async highlight(code: string, lang: string) {
        // Handle mermaid code blocks specially - store them and return a placeholder
        if (lang === 'mermaid') {
          const id = `__MERMAID_${Date.now()}_${Math.random().toString(36).slice(2)}__`;
          mermaidBlocks.set(id, code);
          return id;
        }

        try {
          // Use Shiki to highlight code blocks
          const html = await codeToHtml(code, {
            lang: lang || 'text',
            themes: {
              light: SHIKI_THEMES.light,
              dark: SHIKI_THEMES.dark,
            },
            defaultColor: false, // Use CSS variables instead
          });

          return html;
        } catch (error) {
          // If highlighting fails, return plain code
          console.warn(`Failed to highlight code block (lang: ${lang}):`, error);
          return code;
        }
      },
    })
  );

  return marked;
}

/**
 * Render markdown string to HTML with syntax highlighting
 * @param markdown Raw markdown string
 * @returns Rendered HTML string with syntax highlighting
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const marked = await createMarkedWithShiki();
  let html = await marked.parse(markdown);

  // Replace mermaid placeholders with actual mermaid divs
  for (const [id, code] of mermaidBlocks.entries()) {
    // The placeholder might be wrapped in <pre><code>...</code></pre> by marked
    // Try multiple patterns to catch it
    const patterns = [
      new RegExp(`<pre><code[^>]*>${id}</code></pre>`, 'g'),
      new RegExp(`<pre><code>${id}</code></pre>`, 'g'),
      new RegExp(id, 'g'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(html)) {
        html = html.replace(pattern, `<div class="mermaid">${code}</div>`);
        break;
      }
    }
  }

  return html;
}
