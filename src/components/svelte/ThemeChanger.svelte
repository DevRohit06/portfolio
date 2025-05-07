<script lang="ts">
  import { onMount } from "svelte";

  // We'll focus on Light/Dark toggle instead of system
  let currentTheme: "light" | "dark" = "light";

  function setTheme(theme: typeof currentTheme) {
    document.documentElement.classList.toggle("dark-theme", theme === "dark");
    localStorage.setItem("theme", theme);
    currentTheme = theme;
    document.dispatchEvent(new Event("themeChanged"));
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
