import { type ClassValue, clsx } from "clsx";
import type { ClientResponse } from "hono/client";
import type { StatusCode } from "hono/utils/http-status";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getTransitionName = (name: string, key: string) => {
  return ` ${name.replace("\\n", " ").replace(" ", "-")}-${key}`;
};

export const truncate = (str: string | null, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length - 3)}...`;
};

// Append 'th', 'st', 'nd', or 'rd' for the day of the month
export const getDateSuffix = (day: number) => {
  if (day > 3 && day < 21) return "th"; // Special case for 11th-13th
  return ["th", "st", "nd", "rd"][day % 10] || "th";
};

export const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-IN", options);

  const day = date.getDate();

  return formattedDate.replace(/\d+,/, day + getDateSuffix(day));
};

export const formatDateByTimeZone = (date: Date) => {
  return date.toLocaleString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Bangkok",
  });
};

export const formatNumber = (value: number): string => {
  const formatter = new Intl.NumberFormat("en-US");
  return formatter.format(value);
};

export const fetcher =
  <T>(fn: () => Promise<ClientResponse<T, StatusCode, "json">>) =>
  () =>
    fn().then((res) => {
      if (res.status !== 200) {
        throw new Error("Failed to fetch data");
      }
      return res.json();
    });

export const catchError = async <T>(
  promise: Promise<T>
): Promise<[undefined, T] | [Error]> => {
  return promise
    .then((data) => [undefined, data] as [undefined, T])
    .catch((error) => [error]);
};
