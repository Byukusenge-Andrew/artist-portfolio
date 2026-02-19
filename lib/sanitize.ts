// lib/sanitize.ts

/**
 * Basic HTML/script tag sanitizer for user-generated content.
 * Strips HTML tags and common XSS attack vectors from text inputs
 * before storing in the database.
 *
 * For rich-text content, consider using a dedicated library like
 * `sanitize-html` or `DOMPurify` (with jsdom for server-side).
 */

const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const SCRIPT_REGEX = /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi;
const EVENT_HANDLER_REGEX = /\bon\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URI_REGEX = /javascript\s*:/gi;

/**
 * Sanitize a string by removing HTML tags and script injections.
 * Returns the cleaned string.
 */
export function sanitizeText(input: string): string {
    if (!input) return input;

    return input
        .replace(SCRIPT_REGEX, "")        // Remove script blocks
        .replace(EVENT_HANDLER_REGEX, "")  // Remove event handlers (onclick, etc.)
        .replace(JAVASCRIPT_URI_REGEX, "") // Remove javascript: URIs
        .replace(HTML_TAG_REGEX, "")       // Remove remaining HTML tags
        .trim();
}

/**
 * Sanitize an object's string fields recursively.
 * Used to clean API request bodies before processing.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized = { ...obj };
    for (const key in sanitized) {
        const value = sanitized[key];
        if (typeof value === "string") {
            (sanitized as Record<string, unknown>)[key] = sanitizeText(value);
        } else if (value && typeof value === "object" && !Array.isArray(value)) {
            (sanitized as Record<string, unknown>)[key] = sanitizeObject(
                value as Record<string, unknown>
            );
        }
    }
    return sanitized;
}
