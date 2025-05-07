import HeatMap, { type SVGProps } from "@uiw/react-heat-map";
import React, { useEffect, useState, useRef } from "react";

import { formatDate, formatNumber, getDateSuffix } from "../../lib/utils";
import type { GithubContributionData } from "../../types";

// Optimize date props calculation with memoization
const getDateProps = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setMonth(today.getMonth() - 8);

  return { startDate: oneYearAgo, endDate: today };
};

// Optimize rect rendering with throttling
const renderRect =
  (handleMouseEnter: (date: string) => void): SVGProps["rectRender"] =>
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

    return (
      <rect
        className="transition-all hover:brightness-125"
        onMouseEnter={handleMouseEnterThrottled}
        {...props}
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

  // Get CSS variables for theme-aware colors
  const [panelColors, setPanelColors] = useState({
    1: "#ffffff",
    4: "#9c9cde",
    8: "#3939bd",
    12: "#0707AC",
  });

  // Update colors based on CSS variables and theme when component mounts
  useEffect(() => {
    const updateThemeColors = () => {
      const accentPrimary = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim();

      // Check if currently in dark mode
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      setIsDarkMode(currentTheme === "dark");

      // Function to adjust shade (make lighter or darker)
      const getShade = (hexColor: string, percent: number) => {
        // Convert hex to RGB
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);

        // Adjust brightness
        // Positive percent brightens, negative percent darkens
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

      // Create proper shades of the accent color
      const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
        accentPrimary
      );

      if (isValidHex) {
        if (currentTheme === "dark") {
          // Enhanced contrast color scheme for dark mode
          setPanelColors({
            1: "#263040", // Very dark blue-gray for level 1 in dark mode
            4: "#375a7f", // Medium blue for level 4
            8: "#4a8db7", // Bright blue for level 8
            12: "#6fc2ef", // Light blue for level 12 (highest activity)
          });
        } else {
          // Original light mode colors with accent color
          setPanelColors({
            1: getShade(accentPrimary, 0.85), // Very light shade
            4: getShade(accentPrimary, 0.4), // Light shade
            8: getShade(accentPrimary, 0), // Base accent color
            12: getShade(accentPrimary, -0.3), // Dark shade
          });
        }
      } else {
        // Fallback colors if CSS variable isn't a valid hex
        if (currentTheme === "dark") {
          setPanelColors({
            1: "#263040", // Very dark blue-gray for level 1 in dark mode
            4: "#375a7f", // Medium blue for level 4
            8: "#4a8db7", // Bright blue for level 8
            12: "#6fc2ef", // Light blue for level 12 (highest activity)
          });
        } else {
          setPanelColors({
            1: "#e6e6ff",
            4: "#9c9cde",
            8: "#3939bd",
            12: "#0707AC",
          });
        }
      }
    };

    // Update colors immediately and when theme changes
    updateThemeColors();

    // Listen for theme change events
    document.addEventListener("themeChanged", updateThemeColors);

    // Also observe data-theme attribute changes on document.documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateThemeColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      document.removeEventListener("themeChanged", updateThemeColors);
      observer.disconnect();
    };
  }, []);

  // Use intersection observer to only render when visible
  useEffect(() => {
    if (!chartRef.current || renderedOnce) return;

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

  return (
    <div
      className="relative flex h-full flex-col justify-between max-md:gap-4"
      ref={chartRef}
    >
      <div className="w-full overflow-x-auto">
        {(isVisible || renderedOnce) && (
          <HeatMap
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
            }}
            rectProps={{ rx: 4 }}
            rectSize={16}
            rectRender={renderRect((date) => setHoveredTile(date))}
            panelColors={panelColors}
          />
        )}
      </div>
      {
        <p
          className={`line-clamp-1 text-xs ${isDarkMode ? "text-gray-300" : ""}`}
        >
          {hoveredTile}
        </p>
      }
    </div>
  );
};

export default React.memo(BentoGithubActivity);
