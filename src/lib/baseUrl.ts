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

  if (PUBLIC_VERCEL_URL) {
    return `https://${PUBLIC_VERCEL_URL}`;
  }

  return "http://localhost:4321";
};

export const BASE_URL = getDynamicBaseUrl();

export const getBaseUrl = () => BASE_URL;
