/**
 * Helper to ensure assets (audio, images) resolve correctly on any host,
 * including GitHub Pages with repository subpath (e.g. /my-repo/) and Vercel/local root (/).
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // import.meta.env.BASE_URL is provided by Vite (defaults to '/' or custom base)
  const base = import.meta.env.BASE_URL || './';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  if (base.endsWith('/')) {
    return `${base}${cleanPath}`;
  }
  return `${base}/${cleanPath}`;
}
