// This script runs before anything else loads
(function () {
  // Add a style block to the head to prevent FOUC (Flash of Unstyled Content)
  const styleEl = document.createElement("style");
  styleEl.textContent = "html { visibility: hidden; opacity: 0; transition: opacity 0.3s ease-in-out; }"; // Added opacity for smoother transition
  document.head.appendChild(styleEl);

  // Immediately get theme from localStorage or system preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Determine which theme to use
  const isDarkTheme = savedTheme === "dark" || (!savedTheme && prefersDark);

  // Apply theme class immediately
  if (isDarkTheme) {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }

  // Update theme color meta tag
  const updateThemeColor = () => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute(
        "content",
        document.documentElement.classList.contains("dark-theme")
          ? "#202020"
          : "#C9CDD1"
      );
    }
  };

  // First update
  updateThemeColor();

  // Make content visible now that the theme is applied
  // Clearing the style content will remove "html { visibility: hidden; opacity: 0; ... }"
  // Browsers should then pick up the opacity transition if opacity was 0.
  // Alternatively, to be more direct:
  document.documentElement.style.visibility = 'visible';
  document.documentElement.style.opacity = '1';

  // Optionally, remove the style element from the head after a brief moment,
  // as it's no longer needed and the opacity transition will have started.
  // This is cleaner than styleEl.textContent = "";
  setTimeout(() => {
    if (styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  }, 50); // Small delay to ensure transition starts

  // Re-apply theme on DOMContentLoaded for extra robustness
  window.addEventListener("DOMContentLoaded", function () {
    // Re-check theme just to be safe
    const currentSavedTheme = localStorage.getItem("theme");
    const currentPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldBeDark =
      currentSavedTheme === "dark" ||
      (!currentSavedTheme && currentPrefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }

    // Update theme color
    updateThemeColor();
  });
})();
