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

  // Cek preferensi gender suara jawaban ('male' vs 'female')
  let resolvedPath = path;
  try {
    const voiceGender = localStorage.getItem('kore_answer_voice_gender') || 'male';
    if (voiceGender === 'male' && resolvedPath.includes('/audio/tts/options/')) {
      resolvedPath = resolvedPath.replace('/audio/tts/options/', '/audio/tts/options_male/');
    } else if (voiceGender === 'female' && resolvedPath.includes('/audio/tts/options_male/')) {
      resolvedPath = resolvedPath.replace('/audio/tts/options_male/', '/audio/tts/options/');
    }
  } catch {}

  // import.meta.env.BASE_URL is provided by Vite (defaults to '/' or custom base)
  const base = import.meta.env.BASE_URL || './';
  const cleanPath = resolvedPath.startsWith('/') ? resolvedPath.slice(1) : resolvedPath;

  if (base.endsWith('/')) {
    return `${base}${cleanPath}`;
  }
  return `${base}/${cleanPath}`;
}
