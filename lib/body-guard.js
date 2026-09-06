/**
 * Request body size and type guard to protect against memory exhaustion DoS attacks.
 */

const DEFAULT_MAX_BYTES = 100 * 1024; // 100 KB limit

/**
 * Safely parse JSON from a Next.js Request with strict byte limit enforcement.
 * @param {Request} req
 * @param {number} maxBytes
 * @returns {Promise<any>}
 */
export async function parseSafeJson(req, maxBytes = DEFAULT_MAX_BYTES) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    throw new Error(`Payload Too Large: Content-Length exceeds ${maxBytes} bytes limit`);
  }

  const rawBody = await req.text();
  if (rawBody.length > maxBytes) {
    throw new Error(`Payload Too Large: Request body exceeds ${maxBytes} bytes limit`);
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid JSON body");
  }
}
