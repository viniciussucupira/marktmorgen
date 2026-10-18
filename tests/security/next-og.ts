/**
 * next/og for the security journeys (scripts/security-redis.mjs): the real
 * one draws with WebAssembly that only Next's own build can load. A journey
 * checks what a route reads and answers, not how a picture is drawn, so this
 * stand-in answers every drawing with the same small PNG.
 */
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

export class ImageResponse extends Response {
  constructor(element: unknown, options: { headers?: HeadersInit } = {}) {
    void element;
    super(PNG, { headers: { "Content-Type": "image/png", ...(options.headers ?? {}) } });
  }
}
