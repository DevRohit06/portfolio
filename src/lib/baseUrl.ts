import {
  PUBLIC_VERCEL_ENV,
  PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
  PUBLIC_VERCEL_URL,
} from "astro:env/client";

// Use production URL if in production, otherwise use Vercel URL or fallback to localhost
const getDynamicBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (
    PUBLIC_VERCEL_ENV === "production" &&
    PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return "http://localhost:4321";
};

export const BASE_URL = getDynamicBaseUrl();

export const getBaseUrl = () => BASE_URL;

/**
 * Generates a canonical URL for the given path
 * @param {string} path - The path to generate a canonical URL for (can be absolute or relative)
 * @returns {string} The full canonical URL
 */
export const getCanonicalUrl = (path?: string): string => {
  // If no path is provided, use the base URL (homepage)
  if (!path) return BASE_URL;

  // Strip any trailing slashes for consistency except for the root path
  let normalizedPath = path === "/" ? "/" : path.replace(/\/+$/, "");

  // If the path is already an absolute URL, return it as is
  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return normalizedPath;
  }

  // If path doesn't start with a slash, add one
  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `/${normalizedPath}`;
  }

  // For the homepage, return just the base URL without trailing slash
  if (normalizedPath === "/") {
    return BASE_URL;
  }

  // Combine the base URL with the normalized path
  return `${BASE_URL}${normalizedPath}`;
};
