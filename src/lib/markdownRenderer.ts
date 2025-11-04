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

/**
 * Create a marked instance with Shiki syntax highlighting
 */
export async function createMarkedWithShiki() {
  const marked = new Marked(
    markedHighlight({
      async: true,
      async highlight(code: string, lang: string) {
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
  return await marked.parse(markdown);
}
