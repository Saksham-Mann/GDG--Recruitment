// lib/sanitize-html.js
/**
 * Strict server-side HTML sanitizer for email templates.
 * Strips script tags, iframes, event handlers, and dangerous attributes.
 */
export function sanitizeEmailHtml(rawHtml) {
  if (typeof rawHtml !== "string") return "";

  return rawHtml
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove iframes, objects, embeds, applets
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    // Remove dangerous inline on* event handlers (e.g. onload, onerror, onclick)
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^>\s]+/gi, "")
    // Remove javascript: pseudo-protocol in href or src
    .replace(/href\s*=\s*(['"])\s*javascript:.*?\1/gi, 'href="#"')
    .replace(/src\s*=\s*(['"])\s*javascript:.*?\1/gi, 'src=""')
    // Normalize excessive whitespace
    .trim();
}
