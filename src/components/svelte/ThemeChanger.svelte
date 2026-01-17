<script lang="ts">
  import { onMount } from "svelte";

  // We'll focus on Light/Dark toggle instead of system
  let currentTheme: "light" | "dark" = "light";
  let isAnimating = false;

  // Pixel grid configuration
  const PIXEL_SIZE = 40; // Size of each pixel block in px
  const ANIMATION_DURATION = 500; // Total animation duration in ms

  function applyTheme(theme: typeof currentTheme, save: boolean = true) {
    // Update the theme class
    document.documentElement.classList.toggle("dark-theme", theme === "dark");

    // Store the preference only if requested
    if (save) {
      localStorage.setItem("theme", theme);
    }

    currentTheme = theme;

    // Update theme color meta tag for mobile browsers
    updateMetaThemeColor(theme === "dark");

    // Notify other components about the theme change
    document.dispatchEvent(new Event("themeChanged"));
  }

  async function setTheme(theme: typeof currentTheme, save: boolean = true) {
    // Skip if already on this theme or animation in progress
    if (theme === currentTheme || isAnimating) return;

    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyTheme(theme, save);
      return;
    }

    isAnimating = true;

    // Create pixel grid overlay
    const overlay = createPixelGrid(theme);
    document.body.appendChild(overlay);

    // Calculate grid dimensions
    const cols = Math.ceil(window.innerWidth / PIXEL_SIZE);
    const rows = Math.ceil(window.innerHeight / PIXEL_SIZE);
    const maxDistance = cols + rows - 2; // Max Manhattan distance

    // Time for each diagonal wave
    const waveInDuration = ANIMATION_DURATION;
    const delayPerStep = waveInDuration / (maxDistance + 1);

    // Animate pixels from top-left corner (cover screen)
    const pixels = overlay.querySelectorAll(".theme-pixel") as NodeListOf<HTMLElement>;

    pixels.forEach((pixel) => {
      const col = parseInt(pixel.dataset.col || "0");
      const row = parseInt(pixel.dataset.row || "0");
      const distance = col + row;
      const delay = distance * delayPerStep;

      setTimeout(() => {
        pixel.style.opacity = "1";
      }, delay);
    });

    // Wait for screen to be fully covered, then change theme
    setTimeout(() => {
      applyTheme(theme, save);

      // Small pause while fully covered, then reveal new theme
      setTimeout(() => {
        // Fade out pixels from top-left to bottom-right (reveal new theme)
        pixels.forEach((pixel) => {
          const col = parseInt(pixel.dataset.col || "0");
          const row = parseInt(pixel.dataset.row || "0");
          const distance = col + row;
          const delay = distance * delayPerStep;

          setTimeout(() => {
            pixel.style.opacity = "0";
          }, delay);
        });

        // Remove overlay after fade out completes
        setTimeout(() => {
          overlay.remove();
          isAnimating = false;
        }, waveInDuration + 100);
      }, 50); // Small pause while covered
    }, waveInDuration + 50); // Wait for full coverage
  }

  function createPixelGrid(targetTheme: "light" | "dark"): HTMLDivElement {
    const overlay = document.createElement("div");
    overlay.className = "theme-transition-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
      pointer-events: none;
      overflow: hidden;
    `;

    const cols = Math.ceil(window.innerWidth / PIXEL_SIZE);
    const rows = Math.ceil(window.innerHeight / PIXEL_SIZE);

    // Use target theme color for transition overlay
    const pixelColor = targetTheme === "dark" ? "#202020" : "#c9cdd1";

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pixel = document.createElement("div");
        pixel.className = "theme-pixel";
        pixel.dataset.row = String(row);
        pixel.dataset.col = String(col);
        pixel.style.cssText = `
          position: absolute;
          left: ${col * PIXEL_SIZE}px;
          top: ${row * PIXEL_SIZE}px;
          width: ${PIXEL_SIZE}px;
          height: ${PIXEL_SIZE}px;
          background-color: ${pixelColor};
          opacity: 0;
          transition: opacity 50ms ease-out;
        `;
        overlay.appendChild(pixel);
      }
    }

    return overlay;
  }

  // Update meta theme color to match current theme
  function updateMetaThemeColor(isDark: boolean) {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", isDark ? "#202020" : "#C9CDD1");
    }
  }

  onMount(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    // Set theme based on saved preference or system preference
    if (savedTheme === "dark") {
      currentTheme = "dark";
    } else if (savedTheme === "light") {
      currentTheme = "light";
    } else {
      // Use system preference by default
      currentTheme = prefersDark ? "dark" : "light";
      // Do NOT set localStorage here, allowing it to stay in "system" mode
    }

    // Apply theme
    document.documentElement.classList.toggle(
      "dark-theme",
      currentTheme === "dark",
    );

    // Update meta theme color on initial load
    updateMetaThemeColor(currentTheme === "dark");

    // Also listen to system preference changes
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    darkModeMediaQuery.addEventListener("change", (e) => {
      // Only update if there's no saved preference
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light";
        applyTheme(newTheme, false);
      }
    });
  });
</script>

<div class="theme-toggle">
  <button
    class="toggle-option light-option"
    on:click={() => setTheme("light")}
    aria-pressed={currentTheme === "light"}
  >
    Light
  </button>
  <button
    class="toggle-option dark-option"
    on:click={() => setTheme("dark")}
    aria-pressed={currentTheme === "dark"}
  >
    Dark
  </button>
</div>

<style>
  .theme-toggle {
    display: flex;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
  }

  .toggle-option {
    padding: 6px 16px;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition:
      background-color 0.3s ease-in-out,
      color 0.3s ease-in-out;
    min-width: 70px;
    text-align: center;
  }

  .light-option {
    background-color: black;
    color: #c9cdd1;
  }

  .dark-option {
    background-color: #c9cdd1;
    color: #333;
  }

  /* Style adjustments for dark theme */
  :global(html.dark-theme) .light-option {
    background-color: #202020;
    color: #e0e0e0;
  }

  :global(html.dark-theme) .dark-option {
    background-color: black;
    color: #e0e0e0;
  }

  /* Indicate which option is active with stronger text */
  .toggle-option[aria-pressed="true"] {
    font-weight: 500;
  }
</style>
