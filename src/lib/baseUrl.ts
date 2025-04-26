import {
  PUBLIC_VERCEL_ENV,
  PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
  PUBLIC_VERCEL_URL,
} from "astro:env/client";

const url =
  PUBLIC_VERCEL_ENV === "production"
    ? PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    : PUBLIC_VERCEL_URL;

export const BASE_URL = url ? `https://${url}` : "http://localhost:4321";
// export const BASE_URL = "http://localhost:4321";
