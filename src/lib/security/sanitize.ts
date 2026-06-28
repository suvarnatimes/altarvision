export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return input;
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const sanitized = (Array.isArray(obj) ? [...obj] : { ...obj }) as any;
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key]);
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  return sanitized;
}
