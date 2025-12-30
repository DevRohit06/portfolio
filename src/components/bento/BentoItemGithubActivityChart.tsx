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

// Check if code is running in browser
const isBrowser = typeof window !== "undefined";

// Get CSS variable with fallback
const getCSSVariable = (name: string, fallback: string): string => {
  if (!isBrowser) return fallback;

  try {
    const value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  } catch (e) {
    console.warn(`Error getting CSS variable ${name}:`, e);
    return fallback;
  }
};

// Function to get colors from CSS variables
const getChartColors = (isDark: boolean) => {
  if (isDark) {
    return {
      0: getCSSVariable("--github-activity-level0", "#1a2233"),
      1: getCSSVariable("--github-activity-level1", "#2d3342"),
      4: getCSSVariable("--github-activity-level4", "#ff7a60"),
      8: getCSSVariable("--github-activity-level8", "#ff5533"),
      12: getCSSVariable("--github-activity-level12", "#ff3311"),
    };
  } else {
    return {
      0: getCSSVariable("--github-activity-level0", "#f0f0f0"),
      1: getCSSVariable("--github-activity-level1", "#d3ddee"),
      4: getCSSVariable("--github-activity-level4", "#9db3d9"),
      8: getCSSVariable("--github-activity-level8", "#3939bd"),
      12: getCSSVariable("--github-activity-level12", "#0707AC"),
    };
  }
};

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
        className={` ${isDarkMode ? "dark-rect" : ""} hover:brightness-125`}
        onMouseEnter={handleMouseEnterThrottled}
        {...props}
        {...customStyles}
      />
    );
  };

interface Props {
  lastPushedAt: number;
  totalContributions: number;
  contributions: { count: number; date: string }[];
  className?: string;
}

const BentoGithubActivity = ({ className = '', ...props }: Props) => {
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
  const [panelColors, setPanelColors] = useState(getChartColors(false));

  // Get current theme - safely handles server-side rendering
  const getCurrentTheme = useCallback(() => {
    if (!isBrowser) return false;

    // Check both the data-theme attribute and the dark-theme class
    const hasDataTheme =
      document.documentElement.getAttribute("data-theme") === "dark";
    const hasDarkClass =
      document.documentElement.classList.contains("dark-theme");

    return hasDataTheme || hasDarkClass;
  }, []);

  // Update theme and colors when needed
  useEffect(() => {
    if (!isBrowser) return;

    // Initial theme check
    const isDark = getCurrentTheme();
    setIsDarkMode(isDark);
    setPanelColors(getChartColors(isDark));

    const updateThemeAndColors = () => {
      const newDarkMode = getCurrentTheme();
      if (newDarkMode !== isDarkMode) {
        setIsDarkMode(newDarkMode);
        setPanelColors(getChartColors(newDarkMode));
        // Force a re-render of the component
        setForceRender((prev) => prev + 1);
      }
    };

    // Listen for theme change events
    document.addEventListener("themeChanged", updateThemeAndColors);

    // Also observe data-theme attribute and class changes on document.documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          (mutation.type === "attributes" &&
            (mutation.attributeName === "data-theme" ||
              mutation.attributeName === "class")) ||
          (mutation.type === "childList" &&
            mutation.target === document.documentElement)
        ) {
          updateThemeAndColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
      childList: true,
    });

    return () => {
      document.removeEventListener("themeChanged", updateThemeAndColors);
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

  return (
    <div
      className={`relative flex h-full flex-col justify-between max-md:gap-4 ${
        isDarkMode ? "dark-heat-map" : ""
      }`}
      ref={chartRef}
      key={`chart-container-${forceRender}`}
    >
      <div className={`w-full h-full ${className}`}>
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
        
      }
    `;
    document.head.appendChild(styles);
  }
}

export default React.memo(BentoGithubActivity);
