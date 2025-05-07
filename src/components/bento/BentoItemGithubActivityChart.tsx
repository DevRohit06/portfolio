import HeatMap, { type SVGProps } from "@uiw/react-heat-map";
import React, { useEffect, useState, useRef, useCallback } from "react";

import { formatDate, formatNumber, getDateSuffix } from "../../lib/utils";
import type { GithubContributionData } from "../../types";

// Optimize date props calculation with memoization
const getDateProps = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setMonth(today.getMonth() - 8);

  return { startDate: oneYearAgo, endDate: today };
};

// Function to get dark mode colors with high contrast
const getDarkModeColors = () => ({
  0: "#1a2233", // Darker background (no contributions)
  1: "#1d344d", // Very low activity
  4: "#2d6fa3", // More vibrant blue for level 4
  8: "#30a5e8", // Bright blue for level 8
  12: "#78d3ff", // Very light bright blue for highest activity
});

// Function to get light mode colors based on accent
const getLightModeColors = (accentPrimary = "#3939bd") => {
  const getShade = (hexColor: string, percent: number) => {
    // Convert hex to RGB
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);

    // Adjust brightness
    if (percent > 0) {
      // Brighten
      r = Math.min(255, Math.floor(r + (255 - r) * percent));
      g = Math.min(255, Math.floor(g + (255 - g) * percent));
      b = Math.min(255, Math.floor(b + (255 - b) * percent));
    } else {
      // Darken
      const absPercent = Math.abs(percent);
      r = Math.floor(r * (1 - absPercent));
      g = Math.floor(g * (1 - absPercent));
      b = Math.floor(b * (1 - absPercent));
    }

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  return {
    0: "#f0f0f0", // No contributions
    1: getShade(accentPrimary, 0.85), // Very light shade
    4: getShade(accentPrimary, 0.4), // Light shade
    8: getShade(accentPrimary, 0), // Base accent color
    12: getShade(accentPrimary, -0.3), // Dark shade
  };
};

// Check if code is running in browser
const isBrowser = typeof window !== "undefined";

// Optimize rect rendering with throttling
const renderRect =
  (
    handleMouseEnter: (date: string) => void,
    isDarkMode: boolean
  ): SVGProps["rectRender"] =>
  (props, data) => {
    const date = new Date(data.date);
    const formattedDate =
      date.toLocaleDateString("en-US", { day: "numeric", month: "long" }) +
      getDateSuffix(date.getDate());
    const tileInfo = `${
      data.count ? formatNumber(data.count) : "No"
    } contributions on ${formattedDate}`;

    // Add throttled event handling for better performance
    const handleMouseEnterThrottled = (e: React.MouseEvent) => {
      // Only update on every other mouse event to reduce overhead
      if (e.timeStamp % 2 === 0) {
        handleMouseEnter(tileInfo);
      }
    };

    // Add custom styling for dark mode
    const customStyles =
      isDarkMode && data.count ? { style: { filter: "brightness(1.2)" } } : {};

    return (
      <rect
        className={`transition-all ${isDarkMode ? "dark-rect" : ""} hover:brightness-125`}
        onMouseEnter={handleMouseEnterThrottled}
        {...props}
        {...customStyles}
      />
    );
  };

interface Props extends GithubContributionData {}

const BentoGithubActivity = (props: Props) => {
  const defaultValue = `${formatNumber(
    props.totalContributions
  )} contributions in the last year`;
  const [hoveredTile, setHoveredTile] = useState<string>(defaultValue);

  // Add performance optimizations
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [renderedOnce, setRenderedOnce] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [forceRender, setForceRender] = useState(0);

  // Get current theme - safely handles server-side rendering
  const getCurrentTheme = useCallback(() => {
    if (!isBrowser) return false;
    return document.documentElement.getAttribute("data-theme") === "dark";
  }, []);

  // Create memoized panelColors getter that's safe for SSR
  const getPanelColors = useCallback(() => {
    let accentPrimary = "#3939bd"; // Default accent color

    // Only try to access CSS variables in the browser
    if (isBrowser) {
      try {
        const cssAccent = window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--accent-primary")
          .trim();

        if (cssAccent && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cssAccent)) {
          accentPrimary = cssAccent;
        }
      } catch (e) {
        console.warn("Error accessing CSS variables:", e);
      }
    }

    if (isDarkMode) {
      return getDarkModeColors();
    } else {
      return getLightModeColors(accentPrimary);
    }
  }, [isDarkMode]);

  // Update theme and force re-render when theme changes - only run in browser
  useEffect(() => {
    if (!isBrowser) return;

    // Initial theme check
    setIsDarkMode(getCurrentTheme());

    const updateThemeAndRerender = () => {
      const newDarkMode = getCurrentTheme();
      if (newDarkMode !== isDarkMode) {
        setIsDarkMode(newDarkMode);
        // Force a re-render of the component
        setForceRender((prev) => prev + 1);
      }
    };

    // Listen for theme change events
    document.addEventListener("themeChanged", updateThemeAndRerender);

    // Also observe data-theme attribute changes on document.documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateThemeAndRerender();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      document.removeEventListener("themeChanged", updateThemeAndRerender);
      observer.disconnect();
    };
  }, [getCurrentTheme, isDarkMode]);

  // Use intersection observer to only render when visible - only run in browser
  useEffect(() => {
    if (!isBrowser || !chartRef.current || renderedOnce) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setRenderedOnce(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(chartRef.current);

    return () => observer.disconnect();
  }, [renderedOnce]);

  // Get current panel colors based on theme
  const panelColors = getPanelColors();

  return (
    <div
      className={`relative flex h-full flex-col justify-between max-md:gap-4 ${
        isDarkMode ? "dark-heat-map" : ""
      }`}
      ref={chartRef}
      key={`chart-container-${forceRender}`}
    >
      <div className="w-full overflow-x-auto">
        {(isVisible || renderedOnce) && (
          <HeatMap
            key={`heat-map-${forceRender}`}
            {...getDateProps()}
            onMouseLeave={() => setHoveredTile(defaultValue)}
            className="w-full"
            value={props.contributions ?? []}
            weekLabels={false}
            monthLabels={false}
            legendCellSize={0}
            space={4}
            style={{
              color: "var(--text-primary)",
              backgroundColor: "transparent",
              WebkitFontSmoothing: isDarkMode ? "antialiased" : "auto",
            }}
            rectProps={{ rx: 4 }}
            rectSize={16}
            rectRender={renderRect((date) => setHoveredTile(date), isDarkMode)}
            panelColors={panelColors}
          />
        )}
      </div>
      <p
        className={`line-clamp-1 text-xs ${
          isDarkMode ? "text-gray-300 font-light" : ""
        }`}
        style={{
          WebkitFontSmoothing: isDarkMode ? "antialiased" : "auto",
        }}
      >
        {hoveredTile}
      </p>
    </div>
  );
};

// Only add styles in browser environment
if (isBrowser) {
  // Check if style already exists to avoid duplicates
  const styleId = "github-activity-chart-styles";
  if (!document.getElementById(styleId)) {
    const styles = document.createElement("style");
    styles.id = styleId;
    styles.textContent = `
      .dark-heat-map .dark-rect {
        transition: all 0.2s ease;
      }
    `;
    document.head.appendChild(styles);
  }
}

export default React.memo(BentoGithubActivity);
