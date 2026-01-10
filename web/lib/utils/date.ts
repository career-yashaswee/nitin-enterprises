import { formatDistanceToNow } from "date-fns";

/**
 * Formats a date string to a short relative time format (e.g., "2d ago", "just now")
 * @param lastUpdatedAt - ISO date string
 * @returns Formatted string or empty string if invalid
 */
export function formatLastUpdated(lastUpdatedAt?: string): string {
  if (!lastUpdatedAt) return "";
  try {
    const date = new Date(lastUpdatedAt);
    const distance = formatDistanceToNow(date, { addSuffix: true });
    // Convert to short format: "2d ago", "2w ago", "just now", etc.
    if (
      distance.includes("second") ||
      (distance.includes("minute") && distance.includes("less than"))
    ) {
      return "just now";
    }
    const shortDistance = distance
      .replace(/about /g, "")
      .replace(/less than a /g, "")
      .replace(/over /g, "")
      .replace(/almost /g, "")
      .replace(/ minutes?/g, "m")
      .replace(/ hours?/g, "h")
      .replace(/ days?/g, "d")
      .replace(/ weeks?/g, "w")
      .replace(/ months?/g, "mo")
      .replace(/ years?/g, "y");
    return shortDistance;
  } catch {
    return "";
  }
}

/**
 * Formats a date string to a short relative time format (e.g., "2d ago", "just now")
 * Returns null instead of empty string for easier null checking
 * @param lastUpdatedAt - ISO date string
 * @returns Formatted string or null if invalid
 */
export function formatTimestamp(lastUpdatedAt?: string): string | null {
  if (!lastUpdatedAt) return null;
  try {
    const date = new Date(lastUpdatedAt);
    const distance = formatDistanceToNow(date, { addSuffix: true });
    // Convert to short format: "2d ago", "2w ago", "just now", etc.
    if (
      distance.includes("second") ||
      (distance.includes("minute") && distance.includes("less than"))
    ) {
      return "just now";
    }
    const shortDistance = distance
      .replace(/about /g, "")
      .replace(/less than a /g, "")
      .replace(/over /g, "")
      .replace(/almost /g, "")
      .replace(/ minutes?/g, "m")
      .replace(/ hours?/g, "h")
      .replace(/ days?/g, "d")
      .replace(/ weeks?/g, "w")
      .replace(/ months?/g, "mo")
      .replace(/ years?/g, "y");
    return shortDistance;
  } catch {
    return null;
  }
}
