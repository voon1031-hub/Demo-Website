const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes a root-relative path with the deploy base path (for files in public/). */
export function withBase(path: string) {
  return path.startsWith("/") ? `${basePath}${path}` : path;
}
