<script lang="ts">
  import { onMount } from "svelte";

  // We'll focus on Light/Dark toggle instead of system
  let currentTheme: "light" | "dark" = "light";

  function setTheme(theme: typeof currentTheme) {
    // Prevent the flash by hiding content momentarily
    const originalVisibility = document.documentElement.style.visibility;
    document.documentElement.style.visibility = "hidden";
    
    // Update the theme class immediately
    document.documentElement.classList.toggle("dark-theme", theme === "dark");
    
    // Store the preference
    localStorage.setItem("theme", theme);
    currentTheme = theme;
    
    // Update theme color meta tag for mobile browsers
    updateMetaThemeColor(theme === "dark");
    
    // Notify other components about the theme change
    document.dispatchEvent(new Event("themeChanged"));
    
    // Make content visible again after a very brief delay
    // This prevents the flash of incorrect theme
    setTimeout(() => {
      document.documentElement.style.visibility = originalVisibility;
    }, 5);
  }

  // Update meta theme color to match current theme
  function updateMetaThemeColor(isDark) {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute(
        "content",
        isDark ? "#202020" : "#C9CDD1"
      );
    }
  }

  onMount(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Set theme based on saved preference or system preference
    if (savedTheme === "dark") {
      currentTheme = "dark";
    } else if (savedTheme === "light") {
      currentTheme = "light";
    } else {
      // Use system preference by default
      currentTheme = prefersDark ? "dark" : "light";
      localStorage.setItem("theme", currentTheme);
    }

    // Apply theme
    document.documentElement.classList.toggle(
      "dark-theme",
      currentTheme === "dark"
    );
    
    // Update meta theme color on initial load
    updateMetaThemeColor(currentTheme === "dark");
    
    // Also listen to system preference changes
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkModeMediaQuery.addEventListener("change", (e) => {
      // Only update if there's no saved preference
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
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
      background-color 0.2s,
      color 0.2s;
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
